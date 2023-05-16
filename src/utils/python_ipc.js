const readline = require("readline");
function js_client(){
  
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
    console.log("connected");
      rl.on("line", (line) => {
        console.log("input: ", line);
        client.write(line);
        //rl.close();
      });
  });

  client.on('data', (data) => { // 데이터 수신 이벤트
    console.log(data.toString());
  });

  client.on('end', () => { // 접속 종료
    console.log("disconnected");
  });
}

js_client()

module.exports = js_client