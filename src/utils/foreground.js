const {kernel32} = require('./api/kernel32_n.js');
const {psapi} = require('./api/psapi_n.js');
const {user32}= require('./api/user32_n');

module.exports = function getCurrentForegroundProcess() {
  const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;

  // 현재 포어그라운드에서 작동하는 프로세스를 가져오는 메소드 //
  const hWnd = user32.GetForegroundWindow();

  const pid = Buffer.alloc(4);
  user32.GetWindowThreadProcessId(hWnd, pid);
  const threadId = pid.readInt32LE();

  const processHandle = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, threadId);

  const bufferSize = 1024;
  const buffer = Buffer.alloc(bufferSize * 2); // 2바이트 단위로 할당하기 위해 2를 곱함
  const bytesWritten = psapi.GetModuleFileNameExW(processHandle, null, buffer, bufferSize);
  //const name = buffer.toString('utf16le', 0, bytesWritten / 2);
  const name = buffer.toString('utf16le', 0, buffer.indexOf('\u0000\u0000')); // Extract the process name from the buffer
  
  kernel32.CloseHandle(processHandle);

  return [name, threadId];
}

const getCurrentForegroundProcess = require('./foreground.js')
console.log(getCurrentForegroundProcess())

// 포어그라운드 윈도우 이름 가져오기 함수 : //TODO 에러 발생 user32.getForegroundWindow()의 타입값을 pointer로 바꿔야됨.

function getForegroundWindowName() {  
  const hWnd = user32.GetForegroundWindow();

  // Create a buffer to store the window text
  const bufSize = 256;
  const buf = Buffer.alloc(bufSize);
  
  const length = user32.GetWindowTextA(hWnd, buf, bufSize);

  if (length === 0) {
    return null;
  }

  return buf.toString('ascii', 0, length);
  
}

// Call the function to test
//const foregroundWindowName = getForegroundWindowName();
//console.log('Foreground Window Name:', foregroundWindowName);
