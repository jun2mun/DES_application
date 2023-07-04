// EXTERNAL LIBRARY //
const path = require('path');

const { app, BrowserWindow} = require('electron') // Modules to control application life and create native browser window

// INTERNAL LIBRARY //
const sub_process = require('./src/utils/ipc_service.js') // 서비스 실행 모듈

const ipc_socket = require('./src/utils/ipc_socket.js'); // ipc 통신 모듈

// ======================================================================================================================= //
// LOCAL VARIABLES //

let options = { // 접속 정보 설정
  port: 65439,
  host: "127.0.0.1"
};

let client = new ipc_socket(options); // client 연결
client.init()

const camera_service = sub_process() // 카메라 실행

const createWindow = () => { // 데스크톱 앱 화면 띄우기
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration : true, // ?? Electron require() is not defined sol
      contextIsolation: false, // ?? Electron require() is not defined sol
    }
  })
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
  client.send_message('close')
  camera_service.kill('SIGINT')
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// ======================================================================================================================= //



