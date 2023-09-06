const {chart} = require('../components/chart.js')
const {box} = require('../components/box.js');


function TimeGraph($div,p_name,name,char_data){
    console.log(char_data,'timegraph')
    // 스크린 타임 컴포넌트
    let cal = char_data.datasets[0].data.reduce((sum, num) => sum + num);
    let eye_cnt = char_data.datasets[1].data.reduce((sum, num) => sum + num);
    const header = document.createElement('div');
    header.setAttribute("class","header")
    header.innerHTML = `${p_name} 총 스크린 타임 : ${(cal).toFixed(1)}분`
    header.style.fontSize = '10px';
    header.style.margin = '4px';

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
    footer.innerHTML = `분당 눈 깜박임 횟수 : ${eye_cnt.toFixed(1)}회`
    footer.style.fontSize='10px';

    const ScreenTime = box($div,'일간 사용량',[header,mychart,footer],'총 사용량');

    return ScreenTime
}

module.exports = {TimeGraph}