const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { execFile } = require('node:child_process');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

var webContents
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  webContents = mainWindow.webContents
};

function convertFile(event, files) {
  dialog.showOpenDialog({
    properties: ["openDirectory"]
  }).catch((err) => {
    console.log(`Error ${err}`)
  }).then(result => {
    if (result.canceled == true) { return }
    
    files.map((value, index) => {
      var outPath = `${result.filePaths[0]}/${path.basename(value, path.extname(value)) + ".mp4"}`
      
      webContents.send("started-conversion")
      execFile("ffmpeg", [
        '-i', `${value}`,
        '-crf', '28',
        '-vcodec', "h264",
        '-acodec', "aac",
        `${outPath}`
      ], function(error, out, sterr){
        if (!error) {
          if (process.platform == "darwin") {
            execFile("open", [
              outPath
            ])
            execFile("open", [
              path.dirname(outPath)
            ])
          } else {
            execFile(outPath)
            execFile(path.dirname(outPath))
          }
        } else {
          console.log(sterr)
        }
        webContents.send("finished-conversion")
      })
    })
  })
}


app.whenReady().then(() => {
  ipcMain.on("convert-file", convertFile)

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
