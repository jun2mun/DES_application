function button($body,text='button',path=''){

    
    const button2 = document.createElement('button');
    const text2 = document.createTextNode(text);
    button2.appendChild(text2);
    
    button2.addEventListener("click", (e) => {
        console.log('hi path');
        const href = window.location.href = '#detail';
        console.log(href);
    })
    $body.appendChild(button2);
            
}

module.exports = {button};