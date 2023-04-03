const {mainPages} = require('../pages/main.js');
const {detailPages} = require('../pages/detail.js');
const root = document.getElementById('app')

const routes = [
    { path: "/", view: () =>{
        const main = new mainPages(root);
        main.setState();
    }, unmount : () => {
        //deprecated
        const main = new mainPages(root);
        //main.destory();
    }},
    { path: "/detail", view: () =>{
        console.log('detail render')
        const detail = new detailPages(document.getElementById('app'));
        detail.render();
    }},
    { path: "/count", view: () => {
        console.log('count render')
        const counts = new countPages(document.getElementById('app'));
        counts.render();
        console.log('count')
    } },
];

module.exports = routes;