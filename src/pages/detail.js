const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');
const {chart} = require('../components/chart.js');

class detailPages {
    constructor($body){
        this.$body = $body;
    }

    render(){
        console.log('detail render')
        const div = background(this.$body);
        header(div);
        const text = document.createTextNode('detail page');
        div.appendChild(text);
        
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


        // 스크린 타임 컴포넌트
        const ScreenTime2 = box(div);
        ScreenTime2.style.border = 'solid'
        ScreenTime2.style.display =  'flex'
        ScreenTime2.style.flexDirection = 'column'
        ScreenTime2.style.justifyContent = 'center'

        const titles2  =document.createElement('div')
        titles2.innerHTML = '눈 깜박임'
        ScreenTime2.appendChild(titles2)

        const mychart2 = document.createElement('canvas');

        const usage2  =document.createElement('div')
        usage2.innerHTML = `총 깜박임 : ${1}`
        ScreenTime2.appendChild(usage2)

        mychart2.setAttribute('id','myChart2')
        ScreenTime2.appendChild(mychart2);
        ScreenTime2.appendChild(usage2);
        

        const ctx2 = document.getElementById('myChart2');
        chart(ctx2)
    }
}

module.exports = {detailPages};