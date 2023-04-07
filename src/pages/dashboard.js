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
        this.$body.appendChild(div);
        header(div);
        
        const box1 = box(div);
        for (let i = 0;i <5; i++){
            button(box1,`process${i}`,'#detail')
        }
        
        const box2 = box(div);
        for (let i = 0;i <5; i++){
            button(box2,`process${i}`,'#detail')
        }
        
        window.addEventListener("hashchange",(e)=> {
            this.destroy();
        });
    }

    destroy = () => {
        this.$body.innerHTML='';
    }

}

module.exports = {dashboardPage};