function background($body){
    const div = $body;
    div.setAttribute("class","background")
    div.style.backgroundColor='rgb(' + '239' + ',' + '239' + ',' + '244)' 
    div.style.height = '100%'
    div.style.width='100%'
    return div
}

module.exports = {background};