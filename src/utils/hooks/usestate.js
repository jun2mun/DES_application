module.exports = function useState(initState) {
    let state = initState; // state를 정의한다.
    const setState = (newState) => {
      state = newState; // 새로운 state를 할당한다
      render(); // render를 실행한다.
    }
    return [ state, setState ];
  }