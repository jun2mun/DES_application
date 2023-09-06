const {chart} = require('../components/chart.js')
const {box} = require('../components/box.js');

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

module.exports = {ScreenTime}