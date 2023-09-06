const { Chart, registerables, LineController, LineElement, PointElement, LinearScale, Title }  = require("chart.js");

function chart(DOM,type='bar',data,option={}) {
    Chart.register(...registerables)
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title)
    return new Chart(DOM, {
        type: type,
        data: data,
        options : option
    });

}

module.exports = { chart }


