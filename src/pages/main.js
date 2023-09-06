/// 일단 fixed ////
// EXTERNAL LIBRARY //
const { ipcRenderer } = require('electron')

// INTERNAL LIBRARY //
const {background} = require('../components/background.js');
const data = require('../static/statics.js'); // 메인화면 아이콘 배열
const { header } = require('../components/header.js');
const {camera_header} = require('../components/camera_header.js')

class mainPages {
    
    constructor($body){
        this.$body = $body;
        this.iscamera = false
        this.status_img = 0
    }

    setState(){
        console.log("메인페이지 렌더링")
        
        this.render();

        // process 탐지
        let timer = setInterval(() => {
            const payload = 'camera_check'
            ipcRenderer.send('main', payload)
            ipcRenderer.send('status','status_check')
        }, 1000);
        
        ipcRenderer.on('camera_check', (evt, payload) => {
            let prevstate = this.iscamera
            if (payload == 'conn'){
                this.iscamera = true
            }
            else{
                this.iscamera = false
            }
            if (prevstate != this.iscamera){
                prevstate = this.iscamera
                this.render()
            }
        })
        ipcRenderer.on('status_check', (evt, payload) => {
            let prevstate = '0'
            if (payload == 'Good'){
                this.status_img = '0'
            }
            if (payload == 'soso'){
                this.status_img = '1'
            }
            else{
                this.status_img = '2'
            }
            if (prevstate != this.status_img){
                prevstate = this.status_img
                this.render()
            }
        })
        return timer     
    }


    render() {
        
        // TODO 가독성 안좋은데, 수정 할 방법 구안 //
        
        // 배경 //
        this.$body.innerHTML = '';
        const div = background(this.$body); // 배경색 테마 적용
        
        // HEADER //
        camera_header(div);

        

        // BODY //

        
        const button = document.createElement('button');
        button.style.border = 'none';
        button.style.marginTop = '40px';
        button.setAttribute('id','main_button');
        div.appendChild(button);

        // 이미지
        const img = document.createElement("img");
        img.setAttribute('id','logo')
        img.src = data[this.status_img]['src']
        button.appendChild(img);
        
        button.addEventListener("click", (e) => {
            const href = window.location.href ='#dashboard';
            //const href = window.location.href ='#dashboard';
        })

    }

}

module.exports = {mainPages};
