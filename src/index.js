// Body 호출
const { detailPages } = require("./src/pages/detail.js");
const { mainPages } = require("./src/pages/main.js");

const main = new mainPages(document.getElementById('app'));
const detail = new detailPages(document.getElementById('app'));
main.setState();

document.addEventListener("urlchange",(e) => {
    let pathname = e.detail.href;
    console.log("log in")
    switch(pathname) {
        case "/^\/$/":
            main.render();
            break;
        case "/detail":
            console.log("detail on")
            detail.render();
            break;
        default:
    }

})
