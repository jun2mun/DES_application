const ffi = require('ffi-napi');
const kernel32 = require('win32-api')


// Define psapi.dll functions
const psapi = new ffi.Library('psapi', {
  'EnumProcesses': ['bool', ['pointer', 'uint32', 'pointer']],
  'GetModuleInformation': ['bool', ['pointer', 'pointer', 'uint32', 'pointer']],
  'GetModuleFileNameExW': ['uint32', ['pointer', 'pointer', 'pointer', 'uint32']],
  'GetProcessMemoryInfo': ['bool', ['pointer', 'pointer', 'ulong']],
});

module.exports = {
  psapi
};

