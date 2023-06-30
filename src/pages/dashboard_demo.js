// TODO 포어그라운드 전환이 이루어지지 않으면, db query가 진행되지 않아서 현재 사용하는 시간 update 안됨 //

// components //
const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');
const {chart} = require('../components/chart.js')

// utils //
const {db_conn,db_comm, db_disconn } = require('../utils/db_utils.js');
const {getDayOfWeek} = require('../utils/time_utils.js');

// 전역 변수 //

let week_date = getDayOfWeek()
let timer;
let callbackFlag = false;
let total_time = 0;

const { ipcRenderer } = require('electron')
let iscamera = false
const data = [
    { state : 'Good' , src : './public/assets/logo.svg' },
    { state : 'soso' , src : './public/assets/soso.svg' },
    { state : 'bad' , src : './public/assets/bad.svg' },
    { state : 'camera', src : './public/assets/video-camera.svg'},
    { state : 'camera_off', src : './public/assets/video-camera-slash.svg'},
    { state : 'red' , src : './public/assets/red-blinking.svg'}
]
class dashboardTestPage {
    constructor($body){
        this.$body = $body;
        this.data = {
            datasets: [
                {
                    label: 'test',
                    data: [10, 20, 30, 40,50,50,70],
                    // this dataset is drawn below
                    order: 1,
                    type: 'bar'
                },
                {
                    label: 'test2',
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

    // 렌더링 함수
    async go(){
        const payload = 'camera_check'
        ipcRenderer.send('main', payload)

        let temp_total_time = 0
        if(!callbackFlag){
            let result = await (async function() {
                let db = db_conn()
                
                let new_data = {}
                new_data.datasets=[]
                new_data.labels = ['월', '화', '수', '목','금','토','일']
                
                for (let idx=0;idx<7;idx++){
                    let query = `select name,SUM(count) as count, ROUND( SUM( ( julianday(end_time)-JULIANDAY(start_time) ) * 86400/60 ) ,1) AS difference from process where date = '${week_date[idx]}' group by name order by difference desc`
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
        ipcRenderer.on('camera_check', (evt, payload) => {
            if (payload == 'conn'){
                console.log('ipcrender')
                iscamera = true;
            }
            else {
                iscamera = false;
            }
        })
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


        //header(div); // 헤더 출력

        const camera = document.createElement("div");
        camera.style.position = 'fixed'
        camera.style.top = 0
        camera.style.display = 'flex'
        /////
        if (iscamera == false){
            camera.innerHTML =''
            camera.innerHTML = `<div><p>카메라 OFF &nbsp</p></div><img src='${data[4]['src']}'/>`
            div.appendChild(camera)
        }
        else {
            camera.innerHTML =''
            camera.innerHTML = `<div><p>카메라 ON &nbsp</p></div><img src='${data[3]['src']}'/>`
            div.appendChild(camera)
        }

        ScreenTime_demo(div,this.data,total_time) // 스크린 타임 컴포넌트 출력

        most_used_demo(div,this.data) // most used 컴포넌트 출력

    }

}


function ScreenTime_demo($div,data,total_time){
    // 변수 초기화
    let week = [0,0,0,0,0,0,0]; let usage_day = 0;

    console.log(data)
    data.datasets.forEach((result,index) => {
        result.data.forEach((data,idx)=>{
            week[idx] += data
        })
    })
    week.forEach((day)=>{
        if (day != 0){
            usage_day +=1
        }
    })


    // 스크린 타임 컴포넌트
    const header = document.createElement('div');
    header.setAttribute("class","header")
    header.innerHTML = `데모 일일 평균 : ${(total_time/usage_day).toFixed(1)}분`
    header.style.fontSize = '10px';
    header.style.margin = '4px';

    const mychart = document.createElement('canvas');
    mychart.setAttribute('id','myChart')
    mychart.style.height = '300px' // 차트 크기 조정.
    chart(mychart,type=null,data,
        {
            plugins :{
                legend: {
                    display: false
                }
            },
            scales : 
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
    footer.innerHTML = `총 스크린 타임 : ${(total_time).toFixed(1)} min`
    footer.style.fontSize='10px';

    const ScreenTime = box($div,'주간 사용량',[header,mychart,footer],'총 사용량');
    //ScreenTime.style.border = 'solid'


    return ScreenTime
}

// mout used 컴포넌트
function most_used_demo($div,data){
    // 변수 초기화 //
    let dataset = []
    const the_top_few = 4 // 상위 $'{the_top_few}개를 dashboard에 보이기
    
    const MostUsed = box($div,'MOST USED');
    

    for (let i =0; i < the_top_few; i ++){
        let time_used = data.datasets[i].data.reduce((sum, num) => sum + num); // 7일 기준 sum
        console.log(time_used)
        dataset.push(
            { icon : './public/assets/icon.svg', title : `${data.datasets[i].label}`, progressbar :`${time_used.toFixed(1)}`,cnt : `${time_used.toFixed(1)}` }, // 1번. TODO 아이콘을 가져와야 함 2번. progressbar 디자인을 바꿔야됨.
        )
    }
    dataset =[
        { icon : './public/assets/vscode.png', title : `비주얼 스튜디오 코드`, progressbar :`80`,cnt : `252.3`, eye_cnt : `18.7` },
        { icon : './public/assets/logo.svg', title : `눈 어플리케이션`, progressbar :`20`,cnt : `102.2`, eye_cnt : `21.4` },
        { icon : './public/assets/datagrip.png', title : `DataGrip`, progressbar :`30`,cnt : `110.3`, eye_cnt : `20.9` },
        { icon : './public/assets/whale.jpg', title : `네이버 웨일`, progressbar :`40`,cnt : `433.5`, eye_cnt : `17.8` },
    ]

    for (let i = 0;i < the_top_few; i++){


        const element = document.createElement('div');
        const icon = document.createElement('img');
        icon.src = dataset[i]['icon']
        icon.style.height='30px';
        const contents = document.createElement('div');
        const content_title = document.createElement('div');
        content_title.innerText = dataset[i]['title'];
        const content_detail = document.createElement('div');
        
        const bar = document.createElement('progress');
        bar.max='100'; bar.value= dataset[i]['progressbar']
        const use_time = document.createTextNode(` ${dataset[i].cnt} min`)

        const eye_cnt = document.createElement('div')
        eye_cnt.innerHTML = `평균(${dataset[i]['eye_cnt']}회)`
        //eye_cnt.style.border = 'solid';
        eye_cnt.style.display = 'flex';
        eye_cnt.style.alignItems = 'center'
        eye_cnt.style.fontSize = '14px';
        
        contents.appendChild(content_title)
        content_detail.appendChild(bar)
        content_detail.appendChild(use_time);
        contents.appendChild(content_detail)
        element.appendChild(icon)
        element.appendChild(contents)
        element.appendChild(eye_cnt)
        

        button(element,`>>`,`#detail_demo#${dataset[i]['title']}`)
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

module.exports = {dashboardTestPage};