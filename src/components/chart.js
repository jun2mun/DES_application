const { Chart, registerables, LineController, LineElement, PointElement, LinearScale, Title }  = require("chart.js");

function chart(DOM,type,data,option={}) {
    Chart.register(...registerables)
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title)
    return new Chart(DOM, {
        //type: 'bar',
        data: data,
        options : option
    });

}

module.exports = { chart }


