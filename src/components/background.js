function background($body){
    const div = $body;
    div.setAttribute("class","background")
    div.style.backgroundColor='gray';
    div.style.height = '100%'
    div.style.width='100%'
    return div
}

module.exports = {background};