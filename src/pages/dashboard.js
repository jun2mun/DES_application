// TODO 포어그라운드 전환이 이루어지지 않으면, db query가 진행되지 않아서 현재 사용하는 시간 update 안됨 //

// EXTERNAL LIBRARY //
const { ipcRenderer } = require('electron')

// INTERNAL LIBRARY //
const {db_conn,db_comm, db_disconn } = require('../utils/db_utils.js');
const {getDayOfWeek} = require('../utils/time_utils.js');

// components //
const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');
const {chart} = require('../components/chart.js')

// VARIABLES //
const data = require('../static/statics.js')
let week_date = getDayOfWeek()



class dashboardPage {
    constructor($body){
        this.$body = $body;
        this.data = {
            // TODO 로딩 되기 전 데이터 상태 고민 필요 //
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
        },
        this.iscamera = false
        this.total_time = 0;
        this.timer = undefined;
    }
    
    //시작 포인트 //
    setState(){
        
        this.db_query(); // 즉시 실행
        this.event_listener() // ipcrenderer 선언
        
        // 바로 렌더링 //
        this.db_query().then((data)=>{
            console.log('결과',data)
            this.cal(data).then((result)=>{
                this.render()
            })
        })
        // timer 렌더링(10초) //
        this.timer = setInterval(()=>{
            const payload = 'camera_check'
            ipcRenderer.send('main', payload)
            this.db_query().then((data)=>{
                this.cal(data).then((result)=>{
                    this.render()
                })
            }
            )}, 10000)
        
        return this.timer // setinterval 를 리턴
    }

    // query 테스트 렌더링 함수
    async db_query(){
        
        // DB 쿼리 
        let results = []
        let db = db_conn()
        for (let idx=0;idx<7;idx++){
            let query = `select name,SUM(count) as count, ROUND( SUM( ( julianday(end_time)-JULIANDAY(start_time) ) * 86400/60 ) ,1) \
             AS difference from process where date = '${week_date[idx]}' group by name order by difference desc`                
            let result = await db_comm(db,'SELECT',query)
            results.push(result)
        }
        db_disconn(db)
        //console.log('result',results)
        return results
    }

    // 쿼리문 전처리 함수 //
    async cal(data){

        let temp_total_time = 0 // 스크린 타임
        let duplicate = false // 중복 여부 체크
        
        let new_data = {} // object 초기화
        new_data.datasets=[]
        new_data.labels = ['월', '화', '수', '목','금','토','일']
        
        for (let idx=0;idx<(data.length-1);idx++){
            
            let results = data[idx]

            results.forEach((result,index) => {
                
                duplicate = false
                let dup_index = undefined
                
                temp_total_time += result.difference
                
                // 중복 요소 탐색 //
                new_data.datasets.forEach((data,index)=>{
                    if (data.label == result.name){
                        duplicate = true
                        dup_index = index
                    }
                })
                
                // 중복 여부에 따라 다르게 처리 //
                if (!duplicate){
                    new_data.datasets.push({
                        label : `${result.name}`, data: [0*7], order : index, type : 'bar',eye_cnt : 0
                    })
                    new_data.datasets[new_data.datasets.length-1].data[idx-1] = result.difference
                    new_data.datasets[new_data.datasets.length-1].eye_cnt = result.count // 눈 깜박
                }
                if (dup_index != undefined) {
                    new_data.datasets[dup_index].data[idx-1] = result.difference
                    new_data.datasets[dup_index].eye_cnt = result.count // 눈 깜박
                }
    
            })    
        }
        // 파라미터 업데이트
        this.total_time = temp_total_time
        this.data = new_data
        return new_data
    }

    // ipc 연결 체크 //
    event_listener(){
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

    
    render(){
        /*
            스크린 타임 요약 컴포넌트 (ScreenTime)
            container > (title,graph,summary)
            most used 컴포넌트(MostUsed)
        */
        console.log('대시보드 페이지 렌더링')
        
        this.$body.innerHTML = '';
        const div = background(this.$body,this.total_time);

        //header(div); // 헤더 출력

        const camera = document.createElement("div");
        camera.style.position = 'fixed'
        camera.style.top = 0
        camera.style.display = 'flex'
        /////
        if (this.iscamera == false){
            camera.innerHTML =''
            camera.innerHTML = `<div><p>카메라 OFF &nbsp</p></div><img src='${data[4]['src']}'/>`
            div.appendChild(camera)
        }
        else {
            camera.innerHTML =''
            camera.innerHTML = `<div><p>카메라 ON &nbsp</p></div><img src='${data[3]['src']}'/>`
            div.appendChild(camera)
        }

        ScreenTime(div,this.data,this.total_time) // 스크린 타임 컴포넌트 출력

        most_used(div,this.data) // most used 컴포넌트 출력

        //predicted(div,this.data)
    }

}


function ScreenTime($div,data,total_time){
    // 변수 초기화
    let week = [0*7]; let usage_day = 0;

    //console.log(data)

    // TODO 계산 부분 다른 곳으로 빼기 //
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
    header.innerHTML = `일일 평균 : ${(total_time/usage_day).toFixed(1)}분`
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
function most_used($div,data){
    // 변수 초기화 //
    const dataset = []
    const the_top_few = 4 // 상위 $'{the_top_few}개를 dashboard에 보이기
    
    const MostUsed = box($div,'MOST USED');
    
    // TODO 계산 부분 다른곳으로 빼기 //
    for (let i =0; i < the_top_few; i ++){
        let time_used = data.datasets[i].data.reduce((sum, num) => sum + num); // 7일 기준 sum
        dataset.push(
            { icon : './public/assets/icon.svg', title : `${(data.datasets[i].label).split('.exe',1)}`, progressbar :`${time_used.toFixed(1)}`,cnt : `${time_used.toFixed(1)}`,eye_cnt : `${((data.datasets[i].eye_cnt) /time_used).toFixed(1)}` }, // 1번. TODO 아이콘을 가져와야 함 2번. progressbar 디자인을 바꿔야됨.
        )
    }
    console.log(dataset,'결과값')
    for (let i = 0;i < the_top_few; i++){


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

        button(element,`>`,`#detail#${dataset[i]['title']}`)
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

// mout used 컴포넌트
function temp($div,data){
    
    // 변수 초기화 //
    //const dataset = []
    const the_top_few = 4 // 상위 $'{the_top_few}개를 dashboard에 보이기
    
    const MostUsed = box($div,'MOST USED');
    
    // TODO 계산 부분 다른곳으로 빼기 //
    for (let i =0; i < the_top_few; i ++){
        let time_used = data.datasets[i].data.reduce((sum, num) => sum + num); // 7일 기준 sum
        //dataset.push(
        //    { icon : './public/assets/icon.svg', title : `${(data.datasets[i].label).split('.exe',1)}`, progressbar :`${time_used.toFixed(1)}`,cnt : `${time_used.toFixed(1)}`,eye_cnt : `${((data.datasets[i].eye_cnt) /time_used).toFixed(1)}` }, // 1번. TODO 아이콘을 가져와야 함 2번. progressbar 디자인을 바꿔야됨.
        //)
    }
    const dataset =[
        { icon : './public/assets/vscode.png', title : `비주얼 스튜디오 코드`, cnt : `252.3`, eye_cnt : `1시간 사용 시 휴식 요망됨` },
        { icon : './public/assets/logo.svg', title : `눈 어플리케이션`,cnt : `102.2`, eye_cnt : `1.2시간 사용 시 휴식 요망됨` },
        { icon : './public/assets/datagrip.png', title : `DataGrip`, cnt : `110.3`, eye_cnt : `1.3시간 사용 시 휴식 요망됨` },
        { icon : './public/assets/whale.jpg', title : `네이버 웨일`, cnt : `433.5`, eye_cnt : `1.5시간 사용 시 휴식 요망됨` },
    ]
    console.log(dataset,'결과값')
    for (let i = 0;i < the_top_few; i++){


        const element = document.createElement('div');
        const icon = document.createElement('img');
        icon.src = dataset[i]['icon']
        icon.style.height='30px';

        const contents = document.createElement('div');
        const content_title = document.createElement('div');
        content_title.innerText = dataset[i]['title'];
        const content_detail = document.createElement('div');
        
        //const bar = document.createElement('progress');
        //bar.max='100'; bar.value= dataset[i]['progressbar']
        const use_time = document.createTextNode(` ${dataset[i].cnt} min`)

        const eye_cnt = document.createElement('div')
        eye_cnt.innerHTML = `${dataset[i]['eye_cnt']}`
        //eye_cnt.style.border = 'solid';
        eye_cnt.style.display = 'flex';
        eye_cnt.style.alignItems = 'center'
        eye_cnt.style.fontSize = '14px';

        contents.appendChild(content_title)
        //content_detail.appendChild(bar)
        //content_detail.appendChild(use_time);
        contents.appendChild(content_detail)
        element.appendChild(icon)
        element.appendChild(contents)
        element.appendChild(eye_cnt)

        button(element,`>`,`#detail#${dataset[i]['title']}`)
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