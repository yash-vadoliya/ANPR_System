import React, { useEffect, useRef, useState } from 'react';
import { scanCanvasForPlate } from '../services/anprEngine';

export const CameraTile = ({ camera, onPlateDetected, onDeleteCamera }) => {
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const [latestPlate, setLatestPlate] = useState(null);
  const [status, setStatus] = useState('Connecting...');
  const isScanning = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isSubscribed = true;

    if (window.require) {
      const { ipcRenderer } = window.require('electron');

      const handleReady = (event, port) => {
        if (!isSubscribed) return;
        const wsUrl = `ws://localhost:${port}`;

        if (window.JSMpeg) {
          if (playerRef.current) {
            try { playerRef.current.destroy(); } catch (e) { }
          }

          playerRef.current = new window.JSMpeg.Player(wsUrl, {
            canvas: canvas,
            autoplay: true,
            audio: false,
            disableWebAssembly: false,
            onVideoDecode: () => {
              if (isSubscribed) setStatus('Live');
            }
          });
        }
      };

      ipcRenderer.on(`stream-ready-${camera.id}`, handleReady);
      ipcRenderer.send('start-camera-stream', {
        cameraId: camera.id,
        rtspUrl: camera.rtspUrl
      });

      // OCR scan interval: scans in-memory every 800ms
      const scanInterval = setInterval(async () => {
        if (
          canvas &&
          canvas.width > 100 &&
          canvas.height > 100 &&
          !isScanning.current
        ) {
          isScanning.current = true;
          try {
            const detected = await scanCanvasForPlate(canvas);
            if (detected && isSubscribed) {
              setLatestPlate(detected);
              // Send verified plate directly to parent App.jsx for right-side log panel
              onPlateDetected({ ...detected, cameraName: camera.name });
            }
          } finally {
            isScanning.current = false;
          }
        }
      }, 800);

      return () => {
        isSubscribed = false;
        clearInterval(scanInterval);
        ipcRenderer.removeListener(`stream-ready-${camera.id}`, handleReady);
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch (e) { }
          playerRef.current = null;
        }
      };
    }
  }, [camera.id, camera.rtspUrl]);

  return (
    <div className="camera-tile">
      <div className="tile-header">
        <span className="live-dot" />
        <strong>{camera.name}</strong>
        <span className="live-status">[{status}]</span>
        <button
          className="delete-cam-btn"
          title="Delete Camera"
          onClick={() => {
            if (window.require) {
              const { ipcRenderer } = window.require('electron');
              ipcRenderer.send('stop-camera-stream', camera.id);
            }
            onDeleteCamera(camera.id);
          }}
        >
          ✕
        </button>
      </div>

      <div className="stream-viewport">
        <canvas ref={canvasRef} className="video-stream" />

        {latestPlate && (
          <div className="plate-overlay-badge">
            <span className="plate-title">PLATE DETECTED</span>
            <span className="plate-value">{latestPlate.plateNumber}</span>
          </div>
        )}
      </div>

      <div className="stream-footer">
        <strong>RTSP:</strong> {camera.rtspUrl}
      </div>
    </div>
  );
};