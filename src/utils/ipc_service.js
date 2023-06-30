const path = require('path');

let child = require('child_process').execFile;
let executablePath = (path.join(__dirname, path.sep+'backend/main.exe').replace(path.sep+'app.asar', '').replace('\\src\\utils\\','/')).replace('\\','/');

module.exports = function sub_process() {
    return undefined
    return child(executablePath, function(err, data) {
        console.log(executablePath, "start")
          if(err){
             console.error(err);
             return;
          }
      });
}

// index.js 위치 기준
/*
let child = require('child_process').execFile;
let executablePath = (path.join(__dirname, path.sep+'backend/main.exe').replace(path.sep+'app.asar', '').replace('\\src\\utils\\','/')).replace('\\','/');
console.log(executablePath)
let sub_process = child(executablePath, function(err, data) {
  console.log(executablePath, "start")
    if(err){
       console.error(err);
       return;
    }
});

*/