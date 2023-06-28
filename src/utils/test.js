function getTimeOfDay(){
    let today = new Date();
    
    let hours = String(today.getHours()).padStart(2, "0"); // 시
    let minutes = String(today.getMinutes()).padStart(2, "0");  // 분
    let seconds = String(today.getSeconds()).padStart(2, "0");  // 초
    
    return [hours,minutes,seconds]
  }
function getDate(){
    let today = new Date();
    let year = today.getFullYear(); // 년도
    let month = String(today.getMonth() + 1).padStart(2, "0");  // 월
    let date = String(today.getDate()).padStart(2, "0");  // 날짜  
    return [year,month,date]
}
let hi = getTimeOfDay()
console.log(hi)
console.log(getDate())