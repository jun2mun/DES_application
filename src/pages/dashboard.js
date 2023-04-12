const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');
const {chart} = require('../components/chart.js')

const data = {
    datasets: [
        {
            label: 'Bar Dataset',
            data: [10, 20, 30, 40,50,50,70],
            // this dataset is drawn below
            order: 2,
            type: 'bar'
        },
        {
            label: 'Bar Dataset',
            data: [10, 20, 30, 40,50,50,70],
            // this dataset is drawn below
            order: 2,
            type: 'line'
        }
],
    labels: ['월', '화', '수', '목','금','토','일']
}


class dashboardPage {
    constructor($body){
        this.$body = $body;
    }

    render(){
        /*
            스크린 타임 요약 컴포넌트 (ScreenTime)
            container > (title,graph,summary)
            most used 컴포넌트(MostUsed)
        */
        console.log('dashboard render')
 
        const div = background(this.$body);
        header(div); // 헤더 출력
        
        ScreenTime(div) // 스크린 타임 컴포넌트 출력

        most_used(div) // most used 컴포넌트 출력

    }

}


function ScreenTime($div){
    // 스크린 타임 컴포넌트
    const ScreenTime = box($div);
    ScreenTime.style.border = 'solid'
    ScreenTime.style.display =  'flex'
    ScreenTime.style.flexDirection = 'column'
    ScreenTime.style.justifyContent = 'center'

    const titles  =document.createElement('div')
    titles.innerHTML = '일간 사용량'
    ScreenTime.appendChild(titles)

    const mychart = document.createElement('canvas');

    const usage  =document.createElement('div')
    usage.innerHTML = `전체 사용량 : ${1}`
    ScreenTime.appendChild(usage)
    mychart.setAttribute('id','myChart')
    ScreenTime.appendChild(mychart);
    ScreenTime.appendChild(usage);
    

    const ctx = document.getElementById('myChart');
    chart(ctx,type=null,data)

    return ScreenTime
}

// mout used 컴포넌트
function most_used($div){
    const MostUsed = box($div);

    const dataset = [
        { icon : '../../public/assets/icon.svg', title : '1', progressbar : 11},
        
        { icon : '../../public/assets/icon.svg', title : '2', progressbar : 22},
        
        { icon : '../../public/assets/icon.svg', title : '3', progressbar : 33},
        
        { icon : '../../public/assets/icon.svg', title : '4', progressbar : 44},
        
        { icon : '../../public/assets/icon.svg', title : '5', progressbar : 55}
    ] // 테스트 데이터셋

    for (let i = 0;i < 3; i++){
        const element = document.createElement('div');
        const icon = document.createElement('img');
        icon.src = dataset[i]['icon']

        const contents = document.createElement('div');
        const title = document.createTextNode(dataset[i]['title'])
        const bar = document.createElement('progress');
        bar.max='100'; bar.value= dataset[i]['progressbar']
        const use_time = document.createTextNode('2h 32m')

        contents.appendChild(title)
        contents.appendChild(bar)
        contents.appendChild(use_time);
        element.appendChild(icon)
        element.appendChild(contents)
        button(element,`process${i}`,'#detail')
        MostUsed.appendChild(element)
        element.style.display = 'flex';
        element.style.justifyContent = 'space-between'
        element.style.padding = '10px'
        element.style.border= 'solid';
    }
    return element
    
}

module.exports = {dashboardPage};