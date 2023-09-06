function button($body,text='button',path=''){

    
    const button = document.createElement('button');
    button.setAttribute('id','button_')
    button.style.backgroundColor = 'transparent'
    button.style.border = 'none';
    button.style.fontSize = '15px';

    const text2 = document.createTextNode(text);
    button.appendChild(text2);
    $body.appendChild(button);

/*
    button.addEventListener("click", (e) => {
        const href = window.location.href = path;
        console.log(href);
    })
*/
}

module.exports = {button};