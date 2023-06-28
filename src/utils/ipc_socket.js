var net = require('net');

module.exports = function ipc_socket(){
  var options = { // 접속 정보 설정
    port: 65439,
    host: "127.0.0.1"
  };
  return net.connect(options, () => { // 서버 접속
    console.log("server connected");
    yes_client()
  });
  
}
