// Body 호출
const { detailPages } = require("./src/pages/detail.js");
const { mainPages } = require("./src/pages/main.js");
const routes = require("./src/router/routes.js");

const root = document.getElementById('app')
//main.setState();

// 페이지 전환 함수
const navigateTo = (url) => {
    history.pushState(null, null, url);
    root.remove() // div 삭제 TODO 더 좋은 방법
    router();
}

const router = async () => {
  
    // 현재 route와 현재 페이지 경로가 일치하는지 테스트
    const potentialMatches = routes.map(route => {
      return {
        route: route,
        isMatch: location.pathname === route.path
      };
    });

        // find 메서드를 사용해 isMatch가 true인 객체를 찾는다.
    console.log(potentialMatches)
    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);
    
    // isMatch true인 객체가 없을 때 메인 페이지로 이동
    if (!match) {
        match = {
        route: routes[0],
        isMatch: true
        }
    }
    match.route.view();
    match.route.unmount();
    // #app 엘리먼트에 활성화된 view의 html 삽입
    //document.querySelector('#app').innerHTML = await match.route.view();
    
};

window.addEventListener("popstate",router);// 뒤로가기 or 새로고침

// DOM이 렌더링 되면 router 함수 실행
document.addEventListener("DOMContentLoaded", () => {
    ///C:/Users/owner/Desktop/portfolio/eye_electron_app/index.html
    document.addEventListener("urlchange",(e) => {
        let pathname = e.detail.href;
        e.preventDefault();
        navigateTo(pathname);
    })

    router();
});


