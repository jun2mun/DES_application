const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');
const {chart} = require('../components/chart.js');
const {db_conn,db_comm, db_disconn } = require('../utils/db_utils.js');
const getDayOfWeek = require('../utils/time_utils.js');

let callbackFlag = false;
let today = new Date();
let year = today.getFullYear(); // 년도
let month = String(today.getMonth() + 1).padStart(2, "0");  // 월
let date = String(today.getDate()).padStart(2, "0");  // 날짜
let week_date = getDayOfWeek(`'${year}-${month}-${date}'`)
console.log('detail',week_date)
let timer;
let total_time = 0;

const data2 = {
    datasets: [
    {
        label: '눈 깜박임 증가도',
        data: [10, 20, 30, 40,50,50,70],
        // this dataset is drawn below
        order: 2,
        type: 'line'
    },
],
    labels: ['0분', '30', '60', '90','120','150','180분']
}

class detailPages {
    constructor($body){
        this.$body = $body;
        this.data = {
            datasets: [
                {
                    label: 'query',
                    data: [10, 20, 30, 40,50,50,70],
                    // this dataset is drawn below
                    order: 1,
                    type: 'bar'
                },
                {
                    label: 'photos',
                    data: [10, 20, 30, 40,50,50,70],
                    // this dataset is drawn below
                    order: 2,
                    type: 'bar'
                },
        
            ],
            labels: ['일','월', '화', '수', '목','금','토']
        }
    }
    setState(){
        callbackFlag = false
        this.go(); // 즉시 실행
        return this.db_interact() // 로딩 화면을 띄워야 함.
    }

    async go(){
        let temp_total_time = 0
        if(!callbackFlag){
            let result = await (async function() {
                let db = db_conn()

                let new_data = {}
                new_data.datasets=[]
                new_data.labels = ['0', '2', '4', '8','10','12','14','16','18','20','22','24']
                new_data.datasets ={
                    label : `${'test'}`, data: (new Array(12)).fill(0), type : 'bar'
                }

                for (let idx=0;idx<11;idx++){
                    let query = `select name,count, SUM(ROUND((julianday(end_time)-JULIANDAY(start_time))* 86400/60)) AS difference from process where date = '${year}-${month}-${date}' and name = 'Code.exe' and CAST(strftime('%H',start_time) AS integer) between ${new_data.labels[idx]} and  ${new_data.labels[idx+1]};`

                    console.log(query)
                    let results = await db_comm(db,'SELECT',query)
                    console.log('결과',results)
                    if (results.difference == undefined){
                        new_data.datasets.data[idx] = 0   
                    }
                    else{
                        new_data.datasets.data[idx] = results.difference   
                    }
                                     
                }
                db_disconn(db)
                return new_data
            
            })(); 
            total_time = temp_total_time
            this.data = result
            this.render();
        }    
    }
    db_interact(){
        timer = setInterval(()=>this.go(), 10000)
        return timer
    }

    render(){
        console.log('detail render')
        this.$body.innerHTML = '';
        const div = background(this.$body);
        header(div);
        //const text = document.createTextNode('detail page');
        //div.appendChild(text);

        ScreenTime(div,'screen',this.data) // 앱 사용시간 컴포넌트

        Eyegradient(div,'count',data2) // 눈 깜박임 컴포넌트
    }
}


function ScreenTime($div,name,char_data){
    console.log('screen',char_data)

    // 스크린 타임 컴포넌트
    const header = document.createElement('div');
    header.setAttribute("class","header")
    header.innerHTML = `${char_data}분`

    const mychart = document.createElement('canvas');
    mychart.setAttribute('id',`${name}`)
    mychart.style.height = '300px' // 차트 크기 조정.
    chart(mychart,type=null,char_data)

    const footer = document.createElement('div');
    footer.setAttribute("class","footer")
    footer.innerHTML = `전체 사용량 : ${1}`

    const ScreenTime = box($div,'일간 사용량',[header,mychart,footer],'총 사용량');
    //ScreenTime.style.border = 'solid'


    return ScreenTime



    
}

function Eyegradient($div,name,char_data=null){

    // 스크린 타임 컴포넌트
    const header = document.createElement('div');
    header.setAttribute("class","header")
    header.innerHTML = '일간 깜박임 증가율'

    const mychart = document.createElement('canvas');
    mychart.setAttribute('id',`${name}`)
    mychart.style.height = '300px' // 차트 크기 조정.
    chart(mychart,type=null,char_data)

    //const footer = document.createElement('div');
    //footer.setAttribute("class","footer")
    //footer.innerHTML = `전체 사용량 : ${1}`

    const ScreenTime = box($div,'눈 깜박임',[header,mychart],'총 사용량');
    //ScreenTime.style.border = 'solid'


    return ScreenTime
}

module.exports = {detailPages};