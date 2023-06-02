
const {mainPages} = require('./src/pages/main.js');
const {detailPages} = require('./src/pages/detail.js');
const {dashboardPage} = require('./src/pages/dashboard.js')

// DEMO PAGE //
const {detailTestPages} = require('./src/pages/detail_demo.js');
const {dashboardTestPage} = require('./src/pages/dashboard_demo.js')


const app = document.getElementById('app');
const main = new mainPages(app);
const detail = new detailPages(app);
const dashboard = new dashboardPage(app);
// DEMO CLASS//
const detail_demo = new detailTestPages(app);
const dashboard_demo = new dashboardTestPage(app);

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
            //{ path: /detail/, start:() => detail.setState(url)},
            //{ path: /dashboard/, start:() => dashboard.setState()},
            // DEMO PAGE //
            { path: /detail_demo/, start:() => detail_demo.setState(url)},
            { path: /dashboard_demo/, start:() => dashboard_demo.setState()},
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



