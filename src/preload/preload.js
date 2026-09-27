const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendDetectionAlert: (data) => ipcRenderer.send('detection-alert', data)
});