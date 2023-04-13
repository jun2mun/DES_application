/// 일단 fixed ////

const {background} = require('../components/background.js');

const data = [
    { state : 'Good' , src : './public/assets/logo.svg' },
    { state : 'soso' , src : './public/assets/soso.svg' },
    { state : 'bad' , src : './public/assets/bad.svg' },
]
class mainPages {
    constructor($body){
        this.$body = $body;
    }
    
    setState(){
        console.log("mainpages render")
        this.render();
    }

    render() {
        const div = background(this.$body); // 배경색 테마 적용
        
        //// 가운데 정렬 TODO 컴포넌트화 필요
        div.style.display = 'flex';
        div.style.flexDirection ='column' // 열 정렬
        div.style.justifyContent ='center';
        div.style.alignItems  = 'center'

        /////

        // 이미지
        const img = document.createElement("img");
        img.setAttribute('id','logo')
        img.src = data[1]['src']
        div.appendChild(img);


        // 버튼
        const button = document.createElement('button');
        button.style.width = '400px';
        button.style.height = '50px';
        button.style.marginTop = '40px';
        div.appendChild(button);

        const text = document.createTextNode('자세히 알아보기');
        button.appendChild(text);
        
        button.addEventListener("click", (e) => {
            const href = window.location.href ='#dashboard';
            console.log(href);
        })

    }

}

module.exports = {mainPages};

/*
        // 버튼
        const button = document.createElement('button');
        div.appendChild(button);

        const text = document.createTextNode('자세히 알아보기');
        button.appendChild(text);
        
        button.addEventListener("click", (e) => {
            const href = window.location.href ='#dashboard';
            console.log(href);
        })

        window.addEventListener("hashchange",(e)=> {
            this.destroy();
        });
*/