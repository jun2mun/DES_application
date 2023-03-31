const ffi = require('ffi-napi');


const user32 = new ffi.Library('user32', {
  'GetForegroundWindow': ['long', []],
  'GetWindowThreadProcessId': ['long', ['long', 'pointer']]
});

module.exports = {
    user32
}