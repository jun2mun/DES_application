const {background} = require('../components/background.js');
class mainPages {
    constructor($body){
        this.$body = $body;
    }
    
    setState(){
        console.log("mainpages render")
        this.render();
    }

    render() {
        const div = background();
        
        // 이미지
        const img = document.createElement("img");
        img.setAttribute('id','logo')
        img.src = './public/assets/logo.svg';
        div.appendChild(img);


        // 버튼
        const button = document.createElement('button');
        div.appendChild(button);

        const text = document.createTextNode('자세히 알아보기');
        button.appendChild(text);
        
        button.addEventListener("click", (e) => {
            const href = window.location.href ='#dashboard';
            console.log(href);
        })
        
        
        this.$body.appendChild(div);

        window.addEventListener("hashchange",(e)=> {
            this.destroy();
        });
    }

    destroy = () => {
        this.$body.innerHTML='';
    }

}

module.exports = {mainPages};

/*
<div class="main">
    <img></img>
    <button>button</button>
</div>
*/