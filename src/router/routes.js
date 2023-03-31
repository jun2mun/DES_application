document.addEventListener("click",(e) => {
    const { target } = e;
    if (!target.matches("nav a")){
        return;
    }
    e.preventDefault();
    urlRoutes();
})

const urlRoutes = {
    "/" : {
        
    }
}