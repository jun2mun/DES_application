
// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path') // preload.js 위한 패키지
const ffi = require('ffi-napi') // 외부 모듈 사용 위한 패키지

const createWindow = () => {
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
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const getCurrentForegroundProcess = require('./src/utils/foreground.js')
const getForegroundDuration = require('./src/utils/ps_time.js')
const {db_conn,db_comm, db_disconn } = require('./src/utils/db_utils.js');

// TODO 이벤트 핸들러 형식으로 변경
let prev_name = '';
let prev_pid = '';
// 1초마다 프로세스 변경되었나 감지
let today = new Date();
let year = today.getFullYear(); // 년도
let month = String(today.getMonth() + 1).padStart(2, "0");  // 월
let date = String(today.getDate()).padStart(2, "0");  // 날짜
let hours = String(today.getHours()).padStart(2, "0"); // 시
let minutes = String(today.getMinutes()).padStart(2, "0");  // 분
let seconds = String(today.getSeconds()).padStart(2, "0");  // 초
let prev_time = `${hours}:${minutes}:${seconds}`
setInterval(() => {
    let [name,pid] = getCurrentForegroundProcess();
    name = name.split('\\')
    name = name[name.length-1] + 'e'
    if (prev_pid !== pid) {
      console.log('change')
      let today = new Date();
      let year = today.getFullYear(); // 년도
      let month = String(today.getMonth() + 1).padStart(2, "0");  // 월
      let date = String(today.getDate()).padStart(2, "0");  // 날짜
      let hours = String(today.getHours()).padStart(2, "0"); // 시
      let minutes = String(today.getMinutes()).padStart(2, "0");  // 분
      let seconds = String(today.getSeconds()).padStart(2, "0");  // 초
      let cur_time = `${hours}:${minutes}:${seconds}`
      prev_pid = pid
      prev_name = name
      let db = db_conn()
      let query = `INSERT INTO process (name,start_time,end_time,count,date) VALUES ('${name}','${prev_time}','${cur_time}',30,'${year}-${month}-${date}')`
      db_comm(db,'INSERT',query)
      db_disconn(db)
      prev_time = cur_time

    }
        // Example usage:
}, 1000)



