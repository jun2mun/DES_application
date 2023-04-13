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
    const header = document.createElement('div');
    header.setAttribute("class","header")
    header.innerHTML = '일간 사용량'

    const mychart = document.createElement('canvas');
    mychart.setAttribute('id',`${name}`)
    mychart.style.height = '300px' // 차트 크기 조정.
    chart(mychart,type=null,char_data)

    const footer = document.createElement('div');
    footer.setAttribute("class","footer")
    footer.innerHTML = `전체 사용량 : ${1}`

    const ScreenTime = box($div,'일간 사용량',[header,mychart,footer],'총 사용량');
    ScreenTime.style.border = 'solid'


    return ScreenTime
}

module.exports = {detailPages};