function background(){

    const div = document.createElement("div");
    div.setAttribute("class","main")
    div.style.backgroundColor='gray';
    div.style.height = '1000px'
    return div
}

module.exports = {background};