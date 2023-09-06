const {header} = require('../components/header.js')
const data = require('../static/statics.js')
const {Calender} = require('./calender.js')

function camera_header($div,reload=false){
    // HEADER //
    const camera = header(this.$body);

    if (this.iscamera == false){
        camera.innerHTML =''
        camera.innerHTML = `<div><p>카메라 OFF &nbsp</p></div><img src='${data[4]['src']}'/>`
        $div.appendChild(camera)
    }
    else {
        camera.innerHTML =''
        camera.innerHTML = `<div><p>카메라 ON &nbsp</p></div><img src='${data[3]['src']}'/>`
        $div.appendChild(camera)
    }

    if (reload == false){
        // RELOAD //
        const RELOAD = document.createElement('button');
        RELOAD.style.border = 'none';
        RELOAD.style.position = 'fixed'
        RELOAD.style.top = '5px';
        RELOAD.style.left = '5px';
        RELOAD.style.display = 'flex'
        //RELOAD.setAttribute('id','');
        $div.appendChild(RELOAD);

        // 이미지
        const img = document.createElement("img");
        img.setAttribute('id','reload')
        img.src = data[6]['src']
        RELOAD.appendChild(img);

        // 업데이트 시기 //
        let today = new Date();
        let hours = String(today.getHours()).padStart(2, "0"); // 시
        let minutes = String(today.getMinutes()).padStart(2, "0");  // 분
        //let seconds = String(today.getSeconds()).padStart(2, "0");  // 초
        const box_comment = document.createElement("div")
        box_comment.setAttribute("class","box_comment")
        box_comment.style.paddingLeft = '10px'
        box_comment.style.fontSize = '10px'
        box_comment.innerHTML = `오늘 ${hours}:${minutes} 업데이트 됨`
        RELOAD.appendChild(box_comment)


        // 달력 추가 //
        const calendar = document.createElement("div")
        calendar.style.position = 'fixed'
        calendar.style.border = 'none';
        calendar.style.top = '5px';
        calendar.style.right = '5px';
        calendar.style.display = 'flex'
        $div.appendChild(calendar)
        let calender = new Calender(calendar)
        calender.renderCalender(calender.calenderInit())


        return RELOAD

    }
    
}
module.exports = {camera_header}