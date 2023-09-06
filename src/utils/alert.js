const { Notification } = require('electron');

// 알림 메소드
module.exports = function showNotification (conn) {
  if (conn == true){
    new Notification({ title: 'network connected', body: '카메라 서비스와 연결되었습니다.' }).show()
  }
  else{
    new Notification({ title: 'network disconnected', body: '카메라 서비스와 연결이 끊겼습니다.' }).show()
  }
}
setInterval(()=>{
  console.log('noti')
  new Notification({ title: '눈 피로도 알림', body: '눈 깜박임이 저하되었습니다. 평균(18.4회)'}).show()
},100000)