const { Chart, registerables, LineController, LineElement, PointElement, LinearScale, Title }  = require("chart.js");

function chart(DOM,type,data) {
    Chart.register(...registerables)
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title)
    return new Chart(DOM, {
        //type: 'bar',
        data: data,
     
        options: {
            title: {
            display: true,
            text: 'World population per region (in millions)'
            }
        }
    });

}

module.exports = { chart }


