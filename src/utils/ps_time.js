const ffi = require('ffi-napi');
const ref = require('ref-napi');

const {kernel32} = require('./api/kernel32_n.js');
const {psapi} = require('./api/psapi_n.js');
const {user32}= require('./api/user32_n');

function getForegroundDuration(pid, callback) {
  const hWnd = user32.GetForegroundWindow();

  const procIdBuf = Buffer.alloc(4);
  user32.GetWindowThreadProcessId(hWnd, procIdBuf);

  const procId = pid || procIdBuf.readInt32LE();

  const hProcess = kernel32.OpenProcess(0x0400 | 0x0010, false, procId);

  const lpCreationTime = ref.alloc('int64');
  const lpExitTime = ref.alloc('int64');
  const lpKernelTime = ref.alloc('int64');
  const lpUserTime = ref.alloc('int64');

  const success = kernel32.GetProcessTimes(hProcess, lpCreationTime, lpExitTime, lpKernelTime, lpUserTime);
  if (!success) {
    callback(new Error('Failed to get process times'));
    return;
  }

  const kernelTime = lpKernelTime.readInt64LE();
  const userTime = lpUserTime.readInt64LE();
  const totalTime = kernelTime + userTime;

  callback(null, totalTime / 10000);

  kernel32.CloseHandle(hProcess);
}

// Example usage:
getForegroundDuration(null, (err, duration) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Foreground process duration: ${duration} ms`);
  }
});
