function header($body){

    
    const button2 = document.createElement('button');
    const text2 = document.createTextNode('home');
    button2.appendChild(text2);
    
    button2.addEventListener("click", (e) => {
        const href = window.location.href ='';
        console.log(href);
    })
    $body.appendChild(button2);
            
}

module.exports = {header};