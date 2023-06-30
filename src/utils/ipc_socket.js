const getCurrentForegroundProcess = require('./foreground.js') // 스크린타임 모듈
const showNotification = require('./alert.js') // 알림 모듈
const {getTimeOfDay,getDate} = require('./time_utils.js') // 시간 util 모듈
const {db_conn,db_comm, db_disconn } = require('./db_utils.js'); // DB 관련 모듈
var net = require('net');

module.exports = class ipc_socket{
  constructor(options){
    this.options = options
    this.client = undefined
    this.client_on = false
     // TODO 이벤트 핸들러 형식으로 변경
    this.prev_name = '';
    this.prev_pid = '';
    this.prev_time = '';
    this.pre_eye_cnt = 0;
    // 1초마다 프로세스 변경되었나 감지
  }

  // 시간 초기화
  async time_init(){
    let day = getTimeOfDay() ;let hours = day[0]; let minutes = day[1]; let seconds = day[2]
    this.prev_time = `${hours}:${minutes}:${seconds}`
    return `${hours}:${minutes}:${seconds}` // prev_time
  }

  // 소켓 초기화
  init(){
    this.time_init().then(
      (data) => {
        this.client = net.connect(this.options, () => { // 서버 접속
          console.log("server connected");
          this.yes_client()
        });
        this.client.on('error',(err) => {
          try {
            console.log(err)
            this.client_on = false
            this.no_client()
            console.log('cannot access to socket server')
            // 에러 발생 시(눈탐지 서비스 다운시), 어떻게 해야 할지 TODO
          } catch (error) {
            //console.log(error)
          }
        })
      }
      ) 
  }

  async yes_client(){

    let yes_client_timer = setInterval(()=>{
      if (this.client_on){
        console.log("link with socket server2")
        this.client.write('start') // 이벤트 전달
      }
      else{
        clearInterval(yes_client_timer)
        this.no_client()
      }
    },1000)

    this.client.on('error',(err) => {
      try {
        showNotification(false)
        this.client_on = false
        console.log('cannot access to socket server')
        //console.log('에러 발생 : ',err)
        // 에러 발생 시(눈탐지 서비스 다운시), 어떻게 해야 할지 TODO
      } catch (error) {
        //console.log(error)
      }
    })

    this.client.on('data', (data) => { // 데이터 수신 이벤트
      console.log(data,'?')
      let [name,pid] = getCurrentForegroundProcess();
      name = name.split('\\')
      name = name[name.length-1] + 'e'
      let eye_cnt = data.toString()
      console.log('data hi')
      console.log(this.prev_pid,this.prev_name)
      if ( (this.prev_pid !== pid && this.prev_pid !== '') && (!(eye_cnt == 'no camera' || eye_cnt == 'camera loading' )) ) {
        
        console.log('--- foreground change ---')

        let day = getTimeOfDay() ;let hours = day[0]; let minutes = day[1]; let seconds = day[2]
        let value = getDate(); let year = value[0] ; let month = value[1]; let date = value[2]
        let cur_time = `${hours}:${minutes}:${seconds}`
        let db = db_conn()
        
        let query = `INSERT INTO process (name,start_time,end_time,count,date) VALUES ('${this.prev_name}','${this.prev_time}','${cur_time}',${eye_cnt-this.pre_eye_cnt},'${year}-${month}-${date}')`
        console.log('query',query)

        this.prev_pid = pid
        this.prev_name = name
        this.prev_time = cur_time
        this.pre_eye_cnt = eye_cnt

        db_comm(db,'INSERT',query)
        db_disconn(db)

      }

      if (this.prev_pid == ''){
        // 처음 시작하면
        this.prev_pid = pid
        this.prev_name = name
      }

    });
  

  }
  
  no_client(){
    let socket_timer = setInterval(() => {
      if (this.client_on) {
        console.log('conn')
        showNotification(true)
        clearInterval(socket_timer)
        this.yes_client()
      }
      else {
        this.client = net.connect(this.options, () => { // 서버 접속
          this.client_on = true
          this.pre_eye_cnt = 0;
          console.log("connected to socket server");
        });
        this.client.on('error',(err) => {
          try {
            this.client_on = false
            console.log('cannot access to socket server')
            // 에러 발생 시(눈탐지 서비스 다운시), 어떻게 해야 할지 TODO
          } catch (error) {      
          }
        })
        
        console.log('no client')
        let [name,pid] = getCurrentForegroundProcess();
        name = name.split('\\')
        name = name[name.length-1] + 'e'
        }
        

      }, 1000)
      
  }


}

/* client 꺼져있으면 측정 안됨 
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
      */