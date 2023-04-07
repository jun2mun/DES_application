
const {mainPages} = require('./src/pages/main.js');
const {detailPages} = require('./src/pages/detail.js');
const {dashboardPage} = require('./src/pages/dashboard.js')
const app = document.getElementById('app');
const main = new mainPages(app);
const detail = new detailPages(app);
const dashboard = new dashboardPage(app);

class IndexView {
    constructor(){
        this.init();
        window.addEventListener("hashchange",(e)=> this.onRouteChange(e))
    }
    // app 시작시, 렌더링할 페이지
    init(){
        this.loadContent('');
    }
    
    // hash 경로 변경시, 이벤트 핸들러
    onRouteChange(e){
        const hashLocation = window.location.hash.substring(1);
        //console.log(hashLocation);
        this.loadContent(hashLocation);
    }


    // url 로드 함수
    loadContent(url) {
        const routes = [
            { path: '', start:() => main.setState()},
            { path: "detail", start:() => detail.render()},
            { path: "dashboard", start:() => dashboard.render()},
        ];
        const page = routes.find((page) => page.path === url);
        console.log(page)
        page.start();
    }
}

new IndexView();