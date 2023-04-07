const {header} = require('../components/header.js')
const {background} = require('../components/background.js');
const {box} = require('../components/box.js');
const {button} = require('../components/button.js');

class dashboardPage {
    constructor($body){
        this.$body = $body;
    }

    render(){
        const div = background(this.$body);
        this.$body.appendChild(div)
        header(div);
        
        box(div);

        for (let i = 0;i <10; i++){
            button(div,`process${i}`)
        }
    }
}

module.exports = {dashboardPage};