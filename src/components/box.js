function box($body){

    const div = document.createElement("div");
    div.setAttribute("class","box")
    div.style.backgroundColor='white';
    div.style.height = '400px'
    div.style.width = '400px';
    div.style.borderColor = 'black';
    div.style.borderRadius = '5%';
    div.style.margin = '10px 10px 10px 10px';
    $body.appendChild(div);
    return div
}

module.exports = {box};