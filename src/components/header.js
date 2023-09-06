function header($body){

    const div = document.createElement("div");
    div.style.position = 'fixed'
    div.style.top = 0
    div.style.display = 'flex'
    return div
}

module.exports = {header};