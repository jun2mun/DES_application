
const {kernel32} = require('./api/kernel32_n.js');
const {psapi} = require('./api/psapi_n.js');
const {user32}= require('./api/user32_n');

module.exports = function getCurrentForegroundProcess() {
  const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
  // 현재 포어그라운드에서 작동하는 프로세스를 가져오는 메소드 //
  const hWnd = user32.GetForegroundWindow();

  const pid = Buffer.alloc(4);
  user32.GetWindowThreadProcessId(hWnd, pid);

  const processHandle = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid.readInt32LE());
  
  const buffer = Buffer.alloc(1024);
  psapi.GetModuleFileNameExW(processHandle, null, buffer, buffer.length);
  const name = buffer.toString('utf16le', 0, buffer.indexOf('\u0000\u0000')); // Extract the process name from the buffer
  
  //console.log(`Foreground process: ${name}, PID: ${pid.readInt32LE()}`);
  
  kernel32.CloseHandle(processHandle);
  return [name,pid.readInt32LE()]
}

// 포어그라운드 윈도우 이름 가져오기 함수 : //TODO 에러 발생 user32.getForegroundWindow()의 타입값을 pointer로 바꿔야됨.
/*
module.exports = function getForegroundWindowName() {
    const buf = Buffer.alloc(256)
    const hWnd = user32.GetForegroundWindow()
  
    if (hWnd.isNull()) {
      return null
    }
  
    const length = user32.GetWindowTextA(hWnd, buf, buf.length)
    if (length === 0) {
      return null
    }
    console.log(buf.toString('ascii', 0, length))
    return buf.toString('ascii', 0, length)
}
*/