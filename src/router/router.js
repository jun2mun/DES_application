class IndexView {
    constructor(){
        window.addEventListener("hashchange",(e)=> onRouteChange(e))
    }

    onRouteChange(e){
        console.log(e);
    }
}