/// 일단 fixed ////

const { set } = require('ref-napi');
const {background} = require('../components/background.js');

const data = [
    { state : 'Good' , src : './public/assets/logo.svg' },
    { state : 'soso' , src : './public/assets/soso.svg' },
    { state : 'bad' , src : './public/assets/bad.svg' },
    { state : 'camera', src : './public/assets/video-camera.svg'},
    { state : 'camera_off', src : './public/assets/video-camera-slash.svg'},
    { state : 'red' , src : './public/assets/red-blinking.svg'}
]
let iscamera = false
let status_img = 0
const { ipcRenderer } = require('electron')

class mainPages {
    constructor($body){
        this.$body = $body;
        this.iscamera = false
    }
    setState(){
        console.log("mainpages render")
        this.render();
        let timer = setInterval(() => {
            const payload = 'camera_check'
            ipcRenderer.send('main', payload)
            ipcRenderer.send('status','status_check')
        }, 1000);
        ipcRenderer.on('camera_check', (evt, payload) => {
            let prevstate = iscamera
            if (payload == 'conn'){
                iscamera = true
            }
            else{
                iscamera = false
            }
            if (prevstate != iscamera){
                prevstate = iscamera
                console.log('iscamera',prevstate,iscamera)
                this.render()
            }
        })
        ipcRenderer.on('status_check', (evt, payload) => {
            let prevstate = '0'
            if (payload == 'Good'){
                status_img = '0'
            }
            if (payload == 'soso'){
                status_img = '1'
            }
            else{
                status_img = '2'
            }
            if (prevstate != status_img){
                console.log('isstatus',prevstate,status_img)
                prevstate = status_img
                this.render()
            }
        })
        return timer     
    }


    render() {
        this.$body.innerHTML = '';
        const div = background(this.$body); // 배경색 테마 적용
        
        //// 가운데 정렬 TODO 컴포넌트화 필요
        div.style.display = 'flex';
        div.style.flexDirection ='column' // 열 정렬
        div.style.justifyContent ='center';
        div.style.alignItems  = 'center'


        const camera = document.createElement("div");
        camera.style.position = 'fixed'
        camera.style.top = 0
        camera.style.display = 'flex'
        /////
        if (iscamera == false){
            camera.innerHTML =''
            camera.innerHTML = `<div><p>카메라 OFF &nbsp</p></div><img src='${data[4]['src']}'/>`
            div.appendChild(camera)
        }
        else {
            camera.innerHTML =''
            camera.innerHTML = `<div><p>카메라 ON &nbsp</p></div><img src='${data[3]['src']}'/>`
            div.appendChild(camera)
        }
        



        // 버튼
        const button = document.createElement('button');
        //button.style.width = '400px';
        //button.style.height = '50px';
        button.style.border = 'none';
        button.style.marginTop = '40px';
        button.setAttribute('id','main_button');
        div.appendChild(button);

        //const text = document.createTextNode('자세히 알아보기');
        //button.appendChild(text);
        // 이미지
        const img = document.createElement("img");
        img.setAttribute('id','logo')
        img.src = data[status_img]['src']
        button.appendChild(img);
        
        button.addEventListener("click", (e) => {
            const href = window.location.href ='#dashboard_demo';
            console.log(href);
        })

    }

}

module.exports = {mainPages};
