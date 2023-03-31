const ffi = require("ffi-napi");
const ref = require("ref-napi");

// kernel32.dll
const kernel32 = new ffi.Library("kernel32", {
  OpenProcess: ["pointer", ["uint32", "int32", "uint32"]],
  CloseHandle: ["int", ["pointer"]],
});

// psapi.dll
const psapiDll = new ffi.Library("psapi", {
  EnumProcesses: ["bool", [ref.refType("uint32"), "uint32", ref.refType("uint32")]],
  GetProcessImageFileNameA: ["uint32", ["pointer", "string", "uint32"]],
});


const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
const LIST_SIZE = 1024;
const pidList = Buffer.alloc(LIST_SIZE);
const bytesReturned = ref.alloc("uint32");

if (!psapiDll.EnumProcesses(pidList, LIST_SIZE, bytesReturned)) {
  throw new Error("Failed to execute EnumProcesses function");
}

const listCount = bytesReturned.deref() / 4;
const pidArray = [];
for (let i = 0; i < listCount; i++) {
  pidArray.push(pidList.readInt32LE(i * 4));
}

pidArray.forEach((pid) => {
  const handle = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
  if (handle) {
    const buffer = Buffer.alloc(1024);
    if (psapiDll.GetProcessImageFileNameA(handle, buffer, buffer.length) > 0) {
      const name = buffer.toString("utf8");
      const processName = name.substring(name.lastIndexOf("\\") + 1);
      console.log(`PID: ${pid}, Name: ${processName}`);
    }
    kernel32.CloseHandle(handle);
  }
});
