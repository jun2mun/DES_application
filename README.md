# electron은 multi-process이다.
# main , renderer 두 타입의 프로세스를 다룬다.

# main 프로세스는 Node.js 환경에서 작동 -> 즉, Node.js API , 모듈 사용 가능
# 주 목적은 create and manage 윈도우 어플리케이션 (BrowserWindow 모듈)
# BroswerWindow 클래스 인스턴스들이 각각의 rendere 프로세스의 웹 페이지를 로드한 window를
# 생성한다.

# 메인 프로세스의 windows's webContent 오브젝트로 웹 콘텐츠와 interact 가능



# 윈도우  dll 에서 알아내야 할 것
# 현재 포어그라운드 프로세스 | 프로세스 스크린타임
# if 브라우저 인 경우, url 추출


## createElement를 사용할지 innerHTML를 사용할지 고민함
# -> https://stackoverflow.com/questions/2946656/advantages-of-createelement-over-innerhtml



window.location.href


## 20.3.8 버전 다운그레이드 ##
-> https://stackoverflow.com/questions/75668307/error-in-native-callback-using-ffi-napi-in-electron-and-electron-builder
## 상위 버전 ffi 모듈 버그로 인해 사용 불가. ##