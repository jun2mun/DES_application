module.exports = function getDayOfWeek() {
    const day = new Date();
    const sunday = day.getTime() - 86400000 * day.getDay();
  
    day.setTime(sunday);
  
    const result = [day.toISOString().slice(0, 10)];
  
    for (let i = 1; i < 7; i++) {
      day.setTime(day.getTime() + 86400000);
      result.push(day.toISOString().slice(0, 10));
    }
  
    return result;
  }