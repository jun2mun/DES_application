class mainPages {
    constructor($body){
        this.$body = $body;
    }
    
    setState(){
        this.render();
    }

    render() {
        const div = document.createElement("div");
        div.setAttribute("class","main")

        const img = document.createElement("img");
        img.setAttribute('id','logo')
        img.src = './public/assets/logo.svg';
        div.appendChild(img);

        const button = document.createElement('button');
        div.appendChild(button);

        const text = document.createTextNode('button');
        button.appendChild(text);
        
        button.addEventListener("click", (e) => {
            window.history.pushState("","","/detail/")
            const urlchange = new CustomEvent("urlchange",{
                detail: {href: "/detail"}
            });
            this.derender(div);
            document.dispatchEvent(urlchange);
        })

        this.$body.appendChild(div);
    }

    derender= (element) => {
        this.$body.removeChild(element);
    }

}








module.exports = {mainPages};

/*
<div class="main">
    <img></img>
    <button>button</button>
</div>
*/