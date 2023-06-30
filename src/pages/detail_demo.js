// components //
const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {chart} = require('../components/chart.js');

// utils //
const {db_conn,db_comm, db_disconn } = require('../utils/db_utils.js');
const {getDate} = require('../utils/time_utils.js');

const { ipcRenderer } = require('electron')

// 전역 변수 //
let callbackFlag = false;
let value = getDate(); let year = value[0] ; let month = value[1]; let date = value[2]
let week_date = `'${year}-${month}-${date}'`


let timer;
let total_time = 0;
let iscamera = false
const data = [
    { state : 'Good' , src : './public/assets/logo.svg' },
    { state : 'soso' , src : './public/assets/soso.svg' },
    { state : 'bad' , src : './public/assets/bad.svg' },
    { state : 'camera', src : './public/assets/video-camera.svg'},
    { state : 'camera_off', src : './public/assets/video-camera-slash.svg'},
    { state : 'red' , src : './public/assets/red-blinking.svg'}
]


class detailTestPages {
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
        this.route = ''
    }
    async init(){
        let route = await window.location.hash.substring(1).split('#')[1]
        return new Promise(function(resolve,reject){
            resolve(route)
        })
    }
    setState(){
        callbackFlag = false
        this.init().then((result) =>{
            this.go(result)
            return this.db_interact(result)
        })


    }

    async go(val){
        const payload = 'camera_check'
        ipcRenderer.send('main', payload)
        //console.log('update-------------------')
        // 이 방법으로 hash 값 전달 안해야함.
        let temp_total_time = 0
        this.route = val;
        if(!callbackFlag){
            let result = await (async function() {
                let db = db_conn()

                let new_data = {};
                new_data.datasets=[]
                new_data.labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
                new_data.datasets =[
                    {label : `${val}`, data: (new Array(24)).fill(0), type : 'bar',yAxisID:'y-left'},
                    {label : `${val}`, data: (new Array(24)).fill(0), type : 'line',yAxisID:'y-right'}
                ]

                for (let idx=0;idx<23;idx++){
                    let query = `select name, ROUND( SUM(count) / SUM( ( julianday(end_time)-JULIANDAY(start_time) ) * 86400/60 ) ,1)
                     as count, ROUND( SUM( ( julianday(end_time)-JULIANDAY(start_time) ) * 86400/60 ) ,1) AS difference from process where date = '${year}-${month}-${date}' and name = '${val}' and CAST(strftime('%H',start_time) AS integer) between ${new_data.labels[idx]} and ${new_data.labels[idx]};` // idx +1 에서 수정
                    //console.log(query)
                    let results = await db_comm(db,'SELECT',query)
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
                    
                                     
                }
                db_disconn(db)
                return new_data
            
            })(); 
            console.log("detail page",result)
            total_time = temp_total_time
            this.data = result
            this.render();
        }    
    }
    db_interact(val){
        timer = setInterval(()=>this.go(val), 10000)
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
        const demo_data = {
            "datasets": [
                {
                    "label": "Code.exe",
                    "data": [
                        32.2,
                        16.4,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        15.3,
                        35.6,
                        26.4,
                        0,
                        23.4,
                        42.7,
                        17.2,
                        4.6,
                        0,
                        0,
                        0,
                        0,
                        0,
                        6.3,
                        32.2
                    ],
                    "type": "bar",
                    "yAxisID": "y-left",
                    "borderColor": "rgb(54, 162, 235)",
                    "backgroundColor": "rgba(54, 162, 235, 0.5)"
                },
                {
                    "label": "Code.exe",
                    "data": [
                        18.2,
                        17.3,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        20.8,
                        20.4,
                        0,
                        19.8,
                        17.8,
                        18.4,
                        18.8,
                        0,
                        0,
                        0,
                        0,
                        0,
                        18.7,
                        18.4
                    ],
                    "type": "line",
                    "yAxisID": "y-right",
                    "borderColor": "rgb(255, 99, 132)",
                    "backgroundColor": "rgba(255, 99, 132, 0.5)"
                }
            ],
            "labels": [
                "0",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12",
                "13",
                "14",
                "15",
                "16",
                "17",
                "18",
                "19",
                "20",
                "21",
                "22",
                "23"
            ]
        }
        console.log('detail render')
        this.$body.innerHTML = '';
        const div = background(this.$body);
        //header(div);
        //const text = document.createTextNode('detail page');
        //div.appendChild(text);

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
            console.log('ese')
            camera.innerHTML =''
            camera.innerHTML = `<div><p>카메라 ON &nbsp</p></div><img src='${data[3]['src']}'/>`
            div.appendChild(camera)
        }

        ScreenTime_demo(div,this.route,'screen',demo_data) // 앱 사용시간 컴포넌트
    }
}


function ScreenTime_demo($div,p_name,name,char_data){
    p_name = '비주얼 스튜디오 코드'
    console.log(char_data,"데모데이터")
    // 스크린 타임 컴포넌트
    let cal = char_data.datasets[0].data.reduce((sum, num) => sum + num);
    let eye_cnt = char_data.datasets[1].data.reduce((sum, num) => sum + num);
    const header = document.createElement('div');
    header.setAttribute("class","header")
    header.innerHTML = `"${p_name}" <br/> 총 스크린 타임 : ${(cal).toFixed(1)}분`
    header.style.fontSize = '10px';
    header.style.margin = '4px';

    let time_table =  [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0]; let us_time = 0;
    char_data.datasets[1].data.forEach((result,index) => {
        time_table[index] += result
    })
    time_table.forEach((day)=>{
        if (day != 0){
            us_time +=1
        }
    })

    const mychart = document.createElement('canvas');
    mychart.setAttribute('id',`${name}`)
    mychart.style.height = '300px' // 차트 크기 조정.
    chart(mychart,type=null,char_data,
        {
            plugins :{
                legend: {
                    display: false
                }
            },
            'y-left': {
                type: 'linear',
                position: 'left',
                title: {
                    display: true,
                    text: 'Y Axis Left'
                },
                grid: {
                    display: false
                }
            },
            'y-right': {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: 'Y Axis Right'
                },
                ticks: {
                    callback: (val) => (val.toExponential())
                },
                grid: {
                    display: false
                }
            }
        }    
    )

    const footer = document.createElement('div');
    footer.setAttribute("class","footer")
    footer.innerHTML = `분당 눈 깜박임 횟수 : ${(eye_cnt/us_time).toFixed(1)}회`
    footer.style.fontSize='10px';

    const ScreenTime = box($div,'일간 사용량',[header,mychart,footer],'총 사용량');
    //ScreenTime.style.border = 'solid'
    return ScreenTime
}


module.exports = {detailTestPages};