
const {mainPages} = require('./src/pages/main.js');
const {detailPages} = require('./src/pages/detail.js');
const {dashboardPage} = require('./src/pages/dashboard.js')
const app = document.getElementById('app');
const main = new mainPages(app);
const detail = new detailPages(app);
const dashboard = new dashboardPage(app);

const {ipcRenderer} = require('electron');
let val;
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
        if (val != undefined){
            clearInterval(val) // timer 삭제 
        };
        const hashLocation = window.location.hash.substring(1);
        console.log('route change',hashLocation)
        app.innerHTML = ''; // hash 경로 변경시 초기화
        //console.log(hashLocation);
        this.loadContent(hashLocation);
    }

    // url 로드 함수

    loadContent(url) {
        const routes = [
            { path: /detail/, start:() => detail.setState(url)},
            { path: /dashboard/, start:() => dashboard.setState()},
        ];
        const page = routes.find((page) => 
            page.path.test(url) == true
        );
        console.log('page',page)
        if (url === ''){
            val = main.setState()
        }
        else{
            console.log(page)
            val = page.start()
        }

    }
}

new IndexView();



