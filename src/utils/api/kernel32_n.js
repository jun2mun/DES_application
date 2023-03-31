const ffi = require('ffi-napi');

// Define kernel32.dll functions
const kernel32 = new ffi.Library('kernel32', {
  'OpenProcess': ['pointer', ['uint32', 'int', 'uint32']],
  'CloseHandle': ['bool', ['pointer']],
  'GetProcessTimes': ['bool', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer']]
});

module.exports = {
  kernel32
}