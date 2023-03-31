class detailPages {
    constructor($body){
        this.$body = $body;
    }

    render(){
        const text = document.createTextNode('detail pages');
        this.$body.appendChild(text);
    }
}

module.exports = {detailPages};