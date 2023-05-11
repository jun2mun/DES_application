module.exports = function getDayOfWeek(날짜문자열){ //ex) getDayOfWeek('2022-06-13')

    const week = ['일', '월', '화', '수', '목', '금', '토'];

    //const dayOfWeek = week[new Date(날짜문자열).getDay()];

    //return dayOfWeek;
    day = new Date(날짜문자열).getDay()
    date = String(new Date(날짜문자열).getDate()).padStart(2, "0")
    if ( day != 0){
        return date - day // 이번주 일요일 날짜 구하기
    }

}
