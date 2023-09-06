const {chart} = require('../components/chart.js')
const {box} = require('../components/box.js');

function DailyTime($div,answer,total_time){
    console.log(answer)
    answer = answer[0]
    let data = {
        labels: [
          ],
          datasets: [{
            label: 'daily Time',
            data: [],
          }],
        options:{
            responsive : false
        }    
    }

    for (let idx=0;idx<=answer.length-1;idx++){
        data['labels'].push(answer[idx]['name'])
        data['datasets'][0]['data'].push(answer[idx]['difference'])
    }
    data['labels'].push()


    //console.log(data)
    // 스크린 타임 컴포넌트
    const header = document.createElement('div');
    header.setAttribute("class","header")
    header.style.fontSize = '10px';
    header.style.margin = '4px';

    const mychart = document.createElement('canvas');
    mychart.setAttribute('id','myChart')
    chart(mychart,type='doughnut',data,
      {
        plugins:{
          legend: {
            display: false
          }
        }
      }
    )

    const footer = document.createElement('div');
    footer.setAttribute("class","footer")
    footer.innerHTML = `총 스크린 타임 : ${(total_time).toFixed(1)} min`
    footer.style.fontSize='10px';

    const DailyTime = box($div,'일간 사용량',[header,mychart,footer],'총 사용량');
    //ScreenTime.style.border = 'solid'
    
    return DailyTime
}

module.exports = {DailyTime}