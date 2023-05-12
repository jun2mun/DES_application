function button($body,text='button',path=''){

    
    const button = document.createElement('button');
    const text2 = document.createTextNode(text);
    button.appendChild(text2);
    $body.appendChild(button);

    button.addEventListener("click", (e) => {
        const href = window.location.href = path;
        console.log(href);
    })
}

module.exports = {button};