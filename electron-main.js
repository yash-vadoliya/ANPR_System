const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const WebSocket = require('ws');

ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;
// Map: cameraId -> { wss, process, port }
const activeStreams = new Map();
let portCounter = 9990;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    title: 'Smart ANPR Surveillance Desktop System',
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    backgroundColor: '#0c1017'
  });

  mainWindow.loadURL('http://localhost:5173');

  mainWindow.on('closed', () => {
    mainWindow = null;
    cleanupAllStreams();
  });
}

function cleanupAllStreams() {
  activeStreams.forEach((streamData) => {
    try {
      if (streamData.process) streamData.process.kill('SIGKILL');
      if (streamData.wss) streamData.wss.close();
    } catch (e) { }
  });
  activeStreams.clear();
}

ipcMain.on('start-camera-stream', (event, { cameraId, rtspUrl }) => {
  // If stream is already running for this camera, return the existing port directly
  if (activeStreams.has(cameraId)) {
    const existing = activeStreams.get(cameraId);
    event.reply(`stream-ready-${cameraId}`, existing.port);
    return;
  }

  portCounter += 1;
  const streamPort = portCounter;
  const wss = new WebSocket.Server({ port: streamPort }, () => {
    console.log(`[Stream Relay] ws://localhost:${streamPort} open for ${cameraId}`);
  });

  console.log(`[FFmpeg Spawning] Connecting to: ${rtspUrl}`);

  const ffmpegProc = ffmpeg(rtspUrl)
    .addInputOption('-rtsp_transport', 'tcp')
    .outputFormat('mpegts')
    .videoCodec('mpeg1video')
    .noAudio()
    .size('800x450')
    .fps(25)
    .outputOptions([
      '-b:v 1500k',
      '-maxrate 2000k',
      '-bufsize 3000k',
      '-bf 0',
      '-an'
    ])
    .on('start', (cmd) => {
      console.log(`[FFmpeg Running on :${streamPort}]`);
    })
    .on('error', (err) => {
      console.error(`[FFmpeg Error on :${streamPort}]:`, err.message);
    });

  const streamPipe = ffmpegProc.pipe();
  streamPipe.on('data', (chunk) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(chunk);
      }
    });
  });

  activeStreams.set(cameraId, { wss, process: ffmpegProc, port: streamPort });
  event.reply(`stream-ready-${cameraId}`, streamPort);
});

ipcMain.on('stop-camera-stream', (event, cameraId) => {
  if (activeStreams.has(cameraId)) {
    const streamData = activeStreams.get(cameraId);
    try {
      if (streamData.process) streamData.process.kill('SIGKILL');
      if (streamData.wss) streamData.wss.close();
    } catch (e) { }
    activeStreams.delete(cameraId);
    console.log(`[Stream Relay] Safely closed stream for ${cameraId}`);
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  cleanupAllStreams();
  if (process.platform !== 'darwin') app.quit();
});