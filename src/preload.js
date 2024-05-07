const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  convertFile: (files) => ipcRenderer.send('convert-file', files),
  onStartedConversion: (callback) => ipcRenderer.on("started-conversion", () => callback()),
  onFinishedConversion: (callback) => ipcRenderer.on("finished-conversion", () => callback())
})