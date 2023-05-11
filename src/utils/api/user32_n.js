const ffi = require('ffi-napi');


const user32 = new ffi.Library('user32', {
  'GetForegroundWindow': ['long', []],
  'GetWindowThreadProcessId': ['long', ['long', 'pointer']],
  'SetWinEventHook': [ 'pointer', [ 'int', 'int', 'pointer', 'pointer', 'int', 'int', 'int' ] ],
  'UnhookWinEvent': [ 'bool', [ 'pointer' ] ],
  'GetWindowTextA': [ 'int', [ 'pointer', 'string', 'int' ] ],
});

module.exports = {
    user32
}