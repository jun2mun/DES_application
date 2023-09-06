// Box Component
// 구성
/* 
<div class : box ${id} >
    <div class :box_title/>
    <div class :box_content/>
    <div class :box_comment/>
</div>

*/


function box($body,title=null,content=null,comment=null){
    // content = {name : '', }

    // 
    const div = document.createElement("div");
    div.setAttribute("class","box")
    div.style.width = '300px'; //650
    div.style.height = '300px';
    div.style.margin = '10px 10px 10px 10px';

    if (title != null){
        const box_title = document.createElement("div")
        box_title.setAttribute("class","box_title")
        box_title.style.paddingLeft = '10px'
        box_title.style.fontSize = '10px'
        box_title.innerHTML = `${title}`
        div.appendChild(box_title)
    }


    if (content != null){

        const box_content = document.createElement("div")
        box_content.setAttribute("class","box_content")
        box_content.setAttribute("class","box_content")
        box_content.style.backgroundColor='white';
        box_content.style.borderColor = 'black';
        box_content.style.borderRadius = '3%';
        box_content.style.padding = '10px 10px 10px 10px';
        box_content.style.margin = '10px 10px 10px 10px';

        box_content.style.display =  'flex'
        box_content.style.flexDirection = 'column'
        box_content.style.justifyContent = 'center'
        for (element of content){
            box_content.appendChild(element)
        }
        div.appendChild(box_content)
    }

    /*

    */  



    if (comment != null){
        /*
        let today = new Date();
        let hours = String(today.getHours()).padStart(2, "0"); // 시
        let minutes = String(today.getMinutes()).padStart(2, "0");  // 분
        //let seconds = String(today.getSeconds()).padStart(2, "0");  // 초
        const box_comment = document.createElement("div")
        box_comment.setAttribute("class","box_comment")
        box_comment.style.paddingLeft = '10px'
        box_comment.style.fontSize = '10px'
        box_comment.innerHTML = `오늘 ${hours}:${minutes} 업데이트 됨`
        div.appendChild(box_comment)
        */
    }



    // 적용




    $body.appendChild(div);



    return div
}

module.exports = {box};