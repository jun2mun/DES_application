const { Chart, registerables, LineController, LineElement, PointElement, LinearScale, Title }  = require("chart.js");

function chart(DOM,type,data) {
    Chart.register(...registerables)
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title)
    return new Chart(DOM, {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Bar Dataset',
                data: [10, 20, 30, 40,50,50,70],
                // this dataset is drawn below
                order: 2
            }],
            labels: ['월', '화', '수', '목','금','토','일']
        },
     
        options: {
            title: {
            display: true,
            text: 'World population per region (in millions)'
            }
        }
    });

}

module.exports = { chart }


