
// main.js
const path = require('path');

let child = require('child_process').execFile;
let executablePath = (path.join(__dirname, path.sep+'backend/main.exe').replace(path.sep+'app.asar', '').replace('\\src\\utils\\','/')).replace('\\','/');
let sub_process = child(executablePath, function(err, data) {
  console.log(executablePath, "start")
    if(err){
       console.error(err);
       return;
    }
});


const { Notification } = require('electron');

// 알림 메소드
function showNotification (conn) {
  if (conn == true){
    new Notification({ title: 'network connected', body: '카메라 서비스와 연결되었습니다.' }).show()
  }
  else{
    new Notification({ title: 'network disconnected', body: '카메라 서비스와 연결이 끊겼습니다.' }).show()
  }  
}

const { ipcMain } = require('electron')





// Modules to control application life and create native browser window
const { app, BrowserWindow} = require('electron')
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
  client.write('close')
  sub_process.kill('SIGINT')
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const getCurrentForegroundProcess = require('./src/utils/foreground.js')
const getForegroundDuration = require('./src/utils/ps_time.js')
const {db_conn,db_comm, db_disconn } = require('./src/utils/db_utils.js');
//const js_client = require('./src/utils/python_ipc.js');
//let client = js_client()

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var net = require('net');
var options = { // 접속 정보 설정
  port: 65439,
  host: "127.0.0.1"
};

var client = net.connect(options, () => { // 서버 접속
  console.log("server connected");
  yes_client()
});



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

let pre_eye_cnt = 0;
let client_on = true
client.on('error',(err) => {
  try {
    console.log(err)
    client_on = false
    no_client()
    console.log('cannot access to socket server')
    // 에러 발생 시(눈탐지 서비스 다운시), 어떻게 해야 할지 TODO
  } catch (error) {
    //console.log(error)
  }
})
// ipcMain에서의 이벤트 수신
ipcMain.on('main', (evt, payload) => {
  console.log('ipcMain',client_on)
  if (client_on == true){
    evt.reply('camera_check', 'conn')
  }
  else{
    evt.reply('camera_check', 'disconn')
  }
})

async function yes_client(){
  let yes_client_timer = setInterval(()=>{
    if (client_on){
      console.log("link with socket server")
      client.write('start') // 이벤트 전달
    }
    else{
      clearInterval(yes_client_timer)
      no_client()
    }
  },1000 )
  client.on('error',(err) => {
    try {
      showNotification(false)
      client_on = false
      console.log('cannot access to socket server')
      //console.log('에러 발생 : ',err)
      // 에러 발생 시(눈탐지 서비스 다운시), 어떻게 해야 할지 TODO
    } catch (error) {      
      //console.log(error)
    }
  })
  client.on('data', (data) => { // 데이터 수신 이벤트
    console.log('data recv')
    let [name,pid] = getCurrentForegroundProcess();
    name = name.split('\\')
    name = name[name.length-1] + 'e'
  
    if (prev_pid !== pid && prev_pid !== '') {
      console.log('--- foreground change ---')
      let today = new Date();
      let year = today.getFullYear(); // 년도
      let month = String(today.getMonth() + 1).padStart(2, "0");  // 월
      let date = String(today.getDate()).padStart(2, "0");  // 날짜
      let hours = String(today.getHours()).padStart(2, "0"); // 시
      let minutes = String(today.getMinutes()).padStart(2, "0");  // 분
      let seconds = String(today.getSeconds()).padStart(2, "0");  // 초
      let cur_time = `${hours}:${minutes}:${seconds}`
      let db = db_conn()
      let eye_cnt = data.toString()
      let query = `INSERT INTO process (name,start_time,end_time,count,date) VALUES ('${prev_name}','${prev_time}','${cur_time}',${eye_cnt-pre_eye_cnt},'${year}-${month}-${date}')`
      console.log('query',query)
      prev_pid = pid
      prev_name = name
      prev_time = cur_time
      pre_eye_cnt = eye_cnt
      db_comm(db,'INSERT',query)
      db_disconn(db)
    }
    if (prev_pid == ''){
      // 처음 시작하면
      prev_pid = pid
      prev_name = name
    }
  });
  

}

function no_client(){
  let socket_timer = setInterval(() => {
    if (client_on) {
      showNotification(true)
      clearInterval(socket_timer)
      yes_client()
    }
    else {
      client = net.connect(options, () => { // 서버 접속
        client_on = true
        console.log("connected to socket server");
      });
      client.on('error',(err) => {
        try {
          client_on = false
          console.log('cannot access to socket server')
          // 에러 발생 시(눈탐지 서비스 다운시), 어떻게 해야 할지 TODO
        } catch (error) {      
        }
      })
      
      console.log('no client')
      let [name,pid] = getCurrentForegroundProcess();
      name = name.split('\\')
      name = name[name.length-1] + 'e'

      if (prev_pid !== pid && prev_pid !== '') {
        console.log('--- pid change ---')
        let today = new Date();
        let year = today.getFullYear(); // 년도
        let month = String(today.getMonth() + 1).padStart(2, "0");  // 월
        let date = String(today.getDate()).padStart(2, "0");  // 날짜
        let hours = String(today.getHours()).padStart(2, "0"); // 시
        let minutes = String(today.getMinutes()).padStart(2, "0");  // 분
        let seconds = String(today.getSeconds()).padStart(2, "0");  // 초
        let cur_time = `${hours}:${minutes}:${seconds}`
        let db = db_conn()
        let query = `INSERT INTO process (name,start_time,end_time,count,date) VALUES ('${prev_name}','${prev_time}','${cur_time}',${0},'${year}-${month}-${date}')`
        console.log('query',query)
        prev_pid = pid
        prev_name = name
        prev_time = cur_time
        db_comm(db,'INSERT',query)
        db_disconn(db)
      }
      if (prev_pid == ''){
        // 처음 시작하면
        prev_pid = pid
        prev_name = name
      }
        }

    }, 1000)
    
}


