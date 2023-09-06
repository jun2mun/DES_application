
class Calender {
    constructor($div){
        this.$div = $div
        this.thisMonth = undefined
        this.currentYear = undefined;
        this.currentMonth = undefined
        this.currentDate = undefined
        this.today = undefined
    }
    calenderInit($div) {

        // 날짜 정보 가져오기
        let date = new Date(); // 현재 날짜(로컬 기준) 가져오기
        let utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000); // uct 표준시 도출
        let kstGap = 9 * 60 * 60 * 1000; // 한국 kst 기준시간 더하기
        this.today = new Date(utc + kstGap); // 한국 시간으로 date 객체 만들기(오늘)
      
        this.thisMonth = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
        // 달력에서 표기하는 날짜 객체
      
        this.currentYear = this.thisMonth.getFullYear(); // 달력에서 표기하는 연
        this.currentMonth = this.thisMonth.getMonth(); // 달력에서 표기하는 월
        this.currentDate = this.thisMonth.getDate(); // 달력에서 표기하는 일
    
        this.$div.innerHTML = `
            <div class="sec_cal">
                <div class="cal_nav">
                    <a class="nav-btn go-prev">prev</a>
                    <div class="year-month"></div>
                    <a class="nav-btn go-next">next</a>
                </div>
                <div class="cal_wrap">
                    <div class="days">
                        <div class="day">MON</div>
                        <div class="day">TUE</div>
                        <div class="day">WED</div>
                        <div class="day">THU</div>
                        <div class="day">FRI</div>
                        <div class="day">SAT</div>
                        <div class="day">SUN</div>
                    </div>
                <div class="dates"></div>
                </div>
            </div>
            `
            return this.thisMonth
        }

        renderCalender(thisMonth){
            this.currentYear = thisMonth.getFullYear();
            this.currentMonth = thisMonth.getMonth();
            this.currentDate = thisMonth.getDate();
        
        
            // 이전 달의 마지막 날 날짜와 요일 구하기
            let startDay = new Date(this.currentYear, this.currentMonth, 0);
            let prevDate = startDay.getDate();
            let prevDay = startDay.getDay();
        
            // 이번 달의 마지막날 날짜와 요일 구하기
            let endDay = new Date(this.currentYear, this.currentMonth + 1, 0);
            let nextDate = endDay.getDate();
            let nextDay = endDay.getDay();
        
            // console.log(prevDate, prevDay, nextDate, nextDay);
        
            // 현재 월 표기
            let year_month = document.getElementsByClassName('year-month')[0];
            console.log(year_month)
            year_month.innerText = `${this.currentYear + '.' + (this.currentMonth + 1)}`
        
            // 렌더링 html 요소 생성
            let calendar = document.querySelector('.dates')
            calendar.innerHTML = '';
        
            // 지난달
            for (var i = prevDate - prevDay + 1; i <= prevDate; i++) {
                calendar.innerHTML = calendar.innerHTML + '<div class="day prev disable">' + i + '</div>'
            }
            // 이번달
            for (var i = 1; i <= nextDate; i++) {
                calendar.innerHTML = calendar.innerHTML + '<div class="day current">' + i + '</div>'
            }
            // 다음달
            for (var i = 1; i <= (7 - nextDay == 7 ? 0 : 7 - nextDay); i++) {
                calendar.innerHTML = calendar.innerHTML + '<div class="day next disable">' + i + '</div>'
            }
        
            // 오늘 날짜 표기
            if (this.today.getMonth() == this.currentMonth) {
                let todayDate = this.today.getDate();
                let currentMonthDate = document.querySelectorAll('.dates .current');
                currentMonthDate[todayDate -1].classList.add('today');
            }
        }
        move(){
            const go_prev = document.getElementsByClassName('go-prev')[0]; 
            go_prev.addEventListener('click', function() {
                thisMonth = new Date(this.currentYear, this.currentMonth - 1, 1);
                renderCalender(thisMonth);
                return undefined
            });

            // 다음달로 이동
            const go_next = document.getElementsByClassName('go-next')[0]; 
            go_next.addEventListener('click', function() {
                thisMonth = new Date(this.currentYear, this.currentMonth + 1, 1);
                renderCalender(thisMonth);
                return undefined
            });

            let click_position = document.getElementsByClassName('dates')[0];
            click_position.addEventListener('click',(e)=>{
                let date = e.target.innerHTML
                return date
            })
        }
        // kst 기준 현재시간
        // console.log(thisMonth);
    // 렌더링을 위한 데이터 정리
    
    // 이전달로 이동
    

}

    // 캘린더 렌더링
    
module.exports = { Calender }