const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');
const { Chart } = require("chart.js");

class dashboardPage {
    constructor($body){
        this.$body = $body;
    }

    render(){
        console.log('dashboard render')
        const div = background(this.$body);
        header(div);
        
        const box1 = box(div);
        for (let i = 0;i <5; i++){
            button(box1,`process${i}`,'#detail')
        }
        
        const box2 = box(div);
        for (let i = 0;i <5; i++){
            button(box2,`process${i}`,'#detail')
        }


        const mychart = document.createElement('canvas');
        mychart.setAttribute('id','myChart')
        div.appendChild(mychart);
        const ctx = document.getElementById('myChart');


        new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                borderWidth: 1
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
            }
        });
        
    }

}

module.exports = {dashboardPage};