const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');
const {chart} = require('../components/chart.js')

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
        header(div);
        

        // 스크린 타임 컴포넌트
        const ScreenTime = box(div);
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
        chart(ctx)


        // mout used 컴포넌트
        const MostUsed = box(div);
        
        for (let i = 0;i <5; i++){
            const element = document.createElement('div');
            const icon = document.createElement('img');
            icon.src = '../../public/assets/icon.svg'
    
            const contents = document.createElement('div');
            const title = document.createTextNode('title')
            const bar = document.createTextNode('div');
           
            contents.appendChild(title)
            contents.appendChild(bar)
            element.appendChild(icon)
            element.appendChild(contents)
            button(element,`process${i}`,'#detail')
            MostUsed.appendChild(element)
            element.style.display = 'flex';
            element.style.justifyContent = 'space-between'
            element.style.padding = '10px'
            element.style.border= 'solid';

        }
    }

}

module.exports = {dashboardPage};