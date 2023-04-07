function box($body){

    const div = document.createElement("div");
    div.setAttribute("class","box")
    div.style.backgroundColor='white';
    div.style.height = '100px'
    div.style.borderColor = 'black';
    div.style.borderRadius = '20%';
    div.style.margin = '10px 10px 10px 10px';
    $body.appendChild(div);
    return div
}

module.exports = {box};