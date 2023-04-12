const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');
const {chart} = require('../components/chart.js');

const data = {
    datasets: [
        {
            label: 'Bar Dataset',
            data: [10, 20, 30, 40,50,50,70],
            // this dataset is drawn below
            order: 2,
            type: 'bar'
        },
],
    labels: ['월', '화', '수', '목','금','토','일']
}
const data2 = {
    datasets: [
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

        ScreenTime(div,'screen',data) // 앱 사용시간 컴포넌트

        ScreenTime(div,'count',data2) // 눈 깜박임 컴포넌트
    }
}

function ScreenTime($div,name,char_data=null){
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
    mychart.setAttribute('id',`${name}`)
    ScreenTime.appendChild(mychart);
    ScreenTime.appendChild(usage);
    

    const ctx = document.getElementById(`${name}`);
    chart(ctx,type=null,char_data)

    return ScreenTime
}

module.exports = {detailPages};