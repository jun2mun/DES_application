function background($body){
    const div = $body;
    div.setAttribute("class","background")
    div.style.backgroundColor='rgb(' + '239' + ',' + '239' + ',' + '244)' 
    div.style.height = '100%'
    div.style.width='100%'
    //// 가운데 정렬 TODO 컴포넌트화 필요
    div.style.display = 'flex';
    div.style.flexDirection ='column' // 열 정렬
    div.style.justifyContent ='center';
    div.style.alignItems  = 'center'
    return div
}

module.exports = {background};