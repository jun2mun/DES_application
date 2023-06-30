function getTimeOfDay(){
    let today = new Date();
    
    let hours = String(today.getHours()).padStart(2, "0"); // 시
    let minutes = String(today.getMinutes()).padStart(2, "0");  // 분
    let seconds = String(today.getSeconds()).padStart(2, "0");  // 초
    
    return [hours,minutes,seconds]
  }
function getDate(){
    let today = new Date();
    let year = today.getFullYear(); // 년도
    let month = String(today.getMonth() + 1).padStart(2, "0");  // 월
    let date = String(today.getDate()).padStart(2, "0");  // 날짜  
    return [year,month,date]
}
async function tst(){
  let result = await (getTimeOfDay())
  let result2 = await (getDate())
  return [result,result2]
}
/*
tst().then(
  (data) => {
    console.log(data)
  }
)
*/
var net = require('net');
let options = { // 접속 정보 설정
  port: 65439,
  host: "127.0.0.1"
};
client = net.connect(options, () => { // 서버 접속
  console.log("server connected");
  eye()
});
client_on = true

function eye(){
  let yes_client_timer = setInterval(()=>{
    if (client_on){
      console.log("link with socket server2")
      client.write('start')
    }
    else{
      clearInterval(yes_client_timer)
    }
  },1000)
  
  client.on('data', (data) => { // 데이터 수신 이벤트
    let eye_cnt = data.toString()
    console.log(eye_cnt)
  })
}
