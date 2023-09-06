// TODO 포어그라운드 전환이 이루어지지 않으면, db query가 진행되지 않아서 현재 사용하는 시간 update 안됨 //

// EXTERNAL LIBRARY //
const { ipcRenderer } = require('electron')

// INTERNAL LIBRARY //
const {db_conn,db_comm, db_disconn } = require('../utils/db_utils.js');
const {getDayOfWeek} = require('../utils/time_utils.js');
const {getDate} = require('../utils/time_utils.js') // 시간 util 모듈

// components //
const {background} = require('../components/background.js');
const {camera_header} = require('../components/camera_header.js')

// modules //
const {ScreenTime} = require('../modules/screenTime.js')
const {most_used} = require('../modules/mostUsed.js')
const {TimeGraph} = require('../modules/timeGraph.js')

// VARIABLES //
const data = require('../static/statics.js');
const { DailyTime } = require('../modules/dailyTime.js');
let week_date = getDayOfWeek()


class dashboardPage {
    constructor($body){
        this.$body = $body;
        this.iscamera = false
        this.total_time = 0;
        // timer 렌더링(10초) //
        this.timer = setInterval(()=>{
            const payload = 'camera_check'
            ipcRenderer.send('main', payload)
            this.render()
            }, 100000)    
    }
    //시작 포인트 //
    async render(){
        
        this.$body.innerHTML = '';

        const div = background(this.$body,this.total_time);

        const main = document.createElement('div')
        main.setAttribute('class','wrapper')
        div.appendChild(main)

        // HEADER //
        let reload = camera_header(div);
        reload.addEventListener("click",(e) =>{
            reload.removeEventListener("click", reload, true); // Succeeds
                this.render()
                return
        })

        
        let data = await this.fetch_week_ScreenTime(); // 즉시 실행
        DailyTime(main,data,this.total_time)
        
        data = await this.fetch_시간대별_사용시간and시간대별_눈깜빡임()
        TimeGraph(main,this.route,'screen',data)

        data = await this.fetch_day_screenTime()
        most_used(main,data,4) // most used 컴포넌트 출력

    }

    // query 테스트 렌더링 함수
    async fetch_week_ScreenTime(week=''){
        let db = db_conn()
        let results = []
        for (let idx=0;idx<7;idx++){
            let query = `select name,SUM(count) as count, ROUND( SUM( ( julianday(end_time)-JULIANDAY(start_time) ) * 86400/60 ) ,1) \
                AS difference from process where date = '${week_date[idx]}' group by name order by difference desc`                
            let result = await db_comm(db,'SELECT',query)
            results.push(result)
        }
        db_disconn(db)
        return results
    }

    async fetch_day_screenTime(day){
        let db = db_conn()
        // QUERY 문 //
        let results = []
        let query = `select name,SUM(count) as count, ROUND( SUM( ( julianday(end_time)-JULIANDAY(start_time) ) * 86400/60 ) ,1) \
            AS difference from process where date = '2023-07-25' group by name order by difference desc`             
        let result = await db_comm(db,'SELECT',query)
        results.push(result)
        db_disconn(db)
        return results
    }

    async fetch_시간대별_사용시간and시간대별_눈깜빡임(){
        let value = getDate(); let year = value[0] ; let month = value[1]; let date = value[2]
        let week_date = `'${year}-${month}-${date}'`
        let val = 'whale.exe'
        let new_data = {};
        new_data.datasets=[]
        new_data.labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
        new_data.datasets =[
            {label : `${val}`, data: (new Array(24)).fill(0), type : 'bar',yAxisID:'y-left'},
            {label : `${val}`, data: (new Array(24)).fill(0), type : 'line',yAxisID:'y-right'}
        ]
        // DB 쿼리 
        let results = []
        let db = db_conn()
        for (let idx=0;idx<23;idx++){
            let query = `select name, ROUND( SUM(count) / SUM( ( julianday(end_time)-JULIANDAY(start_time) ) * 86400/60 ) ,1)
             as count, ROUND( SUM( ( julianday(end_time)-JULIANDAY(start_time) ) * 86400/60 ) ,1) AS difference \
              from process where date = '${year}-${month}-${date}' and name = '${val}' \
              and CAST(strftime('%H',start_time) AS integer) between ${new_data.labels[idx]} and ${new_data.labels[idx]};` // idx +1 에서 수정)
            let results = await db_comm(db,'SELECT',query)
            //console.log(query)
        
            if (results[0].difference === null){
                new_data.datasets[0].data[idx] = 0
            }
            else{
                new_data.datasets[0].data[idx] = results[0].difference
            }
            if (results[0].count === null){
                new_data.datasets[1].data[idx] = 0
            }
            else{
                new_data.datasets[1].data[idx] = results[0].count
            }
            this.data2 = new_data
        }

        db_disconn(db)
        //console.log('result',results)

        return new_data

    }


    // ipc 연결 체크 //
    async fetch_health_check(){
        ipcRenderer.on('camera_check', (evt, payload) => {
            let prevstate = this.iscamera
            if (payload == 'conn'){
                this.iscamera = true
            }
            else{
                this.iscamera = false
            }
            if (prevstate != this.iscamera){
                prevstate = this.iscamera
                //this.render()
            }
        })
    }

    

}

module.exports = {dashboardPage};