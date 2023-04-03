class countPages {
    constructor($body){
        this.$body = $body;
    }

    render () {
        text = document.createTextNode('count')
        this.$body.appendChild(text)
    }
}