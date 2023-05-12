// 포어그라운드 전환이 이루어지지 않으면, db query가 진행되지 않아서 현재 사용하는 시간 update 안됨 //

const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');
const {chart} = require('../components/chart.js')
const {db_conn,db_comm, db_disconn } = require('../utils/db_utils.js');
const getDayOfWeek = require('../utils/time_utils.js');
const { clearInterval } = require('timers');
// SELECT 문 : 즉 electron에서 화면 업데이트 되는 것

let today = new Date();
let year = today.getFullYear(); // 년도
let month = String(today.getMonth() + 1).padStart(2, "0");  // 월
let date = String(today.getDate()).padStart(2, "0");  // 날짜
let week_date = getDayOfWeek(`'${year}-${month}-${date}'`)
let timer;
let callbackFlag = false;
let total_time = 0;

class dashboardPage {
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
                new_data.labels = ['월', '화', '수', '목','금','토','일']
                
                for (let idx=0;idx<7;idx++){
                    let query = `select name,count, SUM(ROUND((julianday(end_time)-JULIANDAY(start_time))* 86400/60)) AS difference from process where date = '${year}-${month}-${week_date+idx}' group by name order by difference desc limit 5;`
                    let duplicate = false
                    let results = await db_comm(db,'SELECT',query)
                    results.forEach((result,index) => {
                        //console.log('result',result)
                        duplicate = false
                        let dup_index = undefined
                        temp_total_time += result.difference
                        new_data.datasets.forEach((data,index)=>{
                            if (data.label == result.name){
                                duplicate = true
                                dup_index = index
                            }
                        })
                        if (!duplicate){
                            //console.log(new_data.datasets)
                            new_data.datasets.push({
                                label : `${result.name}`, data: [0,0,0,0,0,0,0], order : index, type : 'bar'
                            })
                            new_data.datasets[new_data.datasets.length-1].data[idx-1] = result.difference
                        }
                        if (dup_index != undefined) {
                            new_data.datasets[dup_index].data[idx-1] = result.difference
                        }
                        //console.log('data',new_data.datasets[index])

                    })
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
        /*
            스크린 타임 요약 컴포넌트 (ScreenTime)
            container > (title,graph,summary)
            most used 컴포넌트(MostUsed)
        */
        console.log('dashboard render')
        this.$body.innerHTML = '';
        const div = background(this.$body,total_time);
        header(div); // 헤더 출력

        ScreenTime(div,this.data,total_time) // 스크린 타임 컴포넌트 출력

        most_used(div,this.data) // most used 컴포넌트 출력

    }

}


function ScreenTime($div,data,total_time){
    // 스크린 타임 컴포넌트
    const header = document.createElement('div');
    header.setAttribute("class","header")
    let week = [0,0,0,0,0,0,0]; let usage_day = 0;
    data.datasets.forEach((result,index) => {
        result.data.forEach((data,idx)=>{
            console.log(idx,data)
            week[idx] += data
        })
    })
    week.forEach((day)=>{
        if (day != 0){
            usage_day +=1
        }
    })

    header.innerHTML = `일일 평균<br/>${total_time/usage_day}분`

    const mychart = document.createElement('canvas');
    mychart.setAttribute('id','myChart')
    mychart.style.height = '300px' // 차트 크기 조정.
    chart(mychart,type=null,data,
        { scale : 
            {
                x: {
                    stacked: true
                },
                y: {
                    stacked : true
                }
            }
        }
    )

    const footer = document.createElement('div');
    footer.setAttribute("class","footer")
    footer.innerHTML = `총 스크린 타임 : ${total_time} min`

    const ScreenTime = box($div,'일간 사용량',[header,mychart,footer],'총 사용량');
    //ScreenTime.style.border = 'solid'


    return ScreenTime
}

// mout used 컴포넌트
function most_used($div,data){
    console.log('most used',data)
    const MostUsed = box($div,'MOST USED');
    const dataset = []
    for (let i =0; i <3; i ++){
        let cal = data.datasets[i].data.reduce((sum, num) => sum + num);
        dataset.push(
            { icon : './public/assets/icon.svg', title : `${data.datasets[i].label}`, progressbar :`${cal}`,cnt : `${cal}` },
        )
    }

    for (let i = 0;i < 3; i++){


        const element = document.createElement('div');
        const icon = document.createElement('img');
        icon.src = dataset[i]['icon']

        const contents = document.createElement('div');
        const content_title = document.createElement('div');
        content_title.innerText = dataset[i]['title'];
        const content_detail = document.createElement('div');
        
        const bar = document.createElement('progress');
        bar.max='100'; bar.value= dataset[i]['progressbar']
        const use_time = document.createTextNode(` ${dataset[i].cnt} min`)

        contents.appendChild(content_title)
        content_detail.appendChild(bar)
        content_detail.appendChild(use_time);
        contents.appendChild(content_detail)
        element.appendChild(icon)
        element.appendChild(contents)

        button(element,`>`,'#detail')
        MostUsed.appendChild(element)
        element.style.background = 'white'
        element.style.borderRadius = '3%';
        element.style.display = 'flex';
        element.style.justifyContent = 'space-between'
        element.style.padding = '10px'
        if (i === 0) {
            element.style.borderTop = 'solid';
        }
        if (i != 2){
            element.style.borderBottom = 'solid';
        };
        if (i === 2){
            element.style.borderBottom = 'solid';
        };

    }

    //MostUsed.style.border = 'solid'
    return element
    
}

module.exports = {dashboardPage};