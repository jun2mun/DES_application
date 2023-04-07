function box($body){

    const div = document.createElement("div");
    div.setAttribute("class","box")
    div.style.backgroundColor='white';
    div.style.height = '100px'
    div.style.borderColor = 'black';
    $body.appendChild(div);
}

module.exports = {box};