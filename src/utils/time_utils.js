// 일주일 날짜 return
function getDayOfWeek() {
  const day = new Date();
  const sunday = day.getTime() - 86400000 * day.getDay();

  day.setTime(sunday);

  const result = [day.toISOString().slice(0, 10)]; // EX : [ '2023-06-25' ]

  for (let i = 1; i < 7; i++) {
    day.setTime(day.getTime() + 86400000);
    result.push(day.toISOString().slice(0, 10));
  }
  //console.log(result)
  return result; // EX : ['2023-06-25','2023-06-26','2023-06-27','2023-06-28','2023-06-29','2023-06-30','2023-07-01']
}
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
module.exports = {getDayOfWeek,getTimeOfDay,getDate}
