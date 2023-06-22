눈 피로도 관리 어플리케이션 개발(2022~2023)
=============================

*   서론
    

현대 사회에서 디지털 기기를 사용하는 사용자가 많아지고 있습니다. 따라서 디지털 기기로 인한 눈 피로 문제도 사회적 문제로 대두 되고 있습니다.

이 디지털 기기 사용으로 인한 문제점은 ‘눈 깜박임 저하’를 야기 한다는 것인데, 이는 눈 건강에 영향을 미치는 요소입니다. (보충 자료) 평소 사람들이 눈 깜박이는 횟수는 디스플레이와 같은 디지털 기기를 사용할 때, 더욱 저하된다는 것을 아래 통계 자료로 확인할 수 있습니다.

따라서 ‘눈 깜박임 데이터’ 를 눈 피로 측정 지표로 활용하도록 하였습니다.

![이 이미지는 대체 속성이 비어있습니다. 그 파일 이름은 image-1.png입니다](https://blog.hakmoon.com/wp-content/uploads/2023/06/image-1.png)

**서론 : 개발 동기**

그렇다면 페르소나는?

A라는 사람은 컴퓨터를 켜서 유투브도 보고, 문서작업도 하며 하루를 보냈다. 어느 순간 자기도 모르는 사이에 눈이 뻑뻑하고 피곤함을 느끼게 되었다. 따라서 A는 **눈이 피곤해지는 것을 예측할 수 있다면, 눈 피로도가 오는 상황을 줄일 수 있지 않을까** 생각하였다. 그렇기 위해서는 앱 사용 패턴을 알아야 하며, 눈 깜박임 횟수도 알아야 한다. 이를 대시보드를 통해 확인할 수 있는 앱을 개발하려고 한다.

따라서 만들어진 어플리케이션을 요약하면 다음과 같다.

![이 이미지는 대체 속성이 비어있습니다. 그 파일 이름은 image-2.png입니다](https://blog.hakmoon.com/wp-content/uploads/2023/06/image-2.png)

어플리케이션 기능 소개 (1)

카메라를 통해 현재 사용자의 눈 깜박임 횟수를 측정해야 한다. 따라서 Face detection 모델을 사용하여 측정을 진행한다.

![이 이미지는 대체 속성이 비어있습니다. 그 파일 이름은 image-4.png입니다](https://blog.hakmoon.com/wp-content/uploads/2023/06/image-4.png)

첫 번째, Face detection 모델을 통해 얼굴을 감지한다. 두 번째, 감지된 얼굴에서 Face Landmark를 사용하여 눈의 위치를 알아낸다. 세 번째, EAR(eye aspect ratio) 값을 통해 눈의 blink rate(눈 깜박임)을 감지한다.

![이 이미지는 대체 속성이 비어있습니다. 그 파일 이름은 image-5.png입니다](https://blog.hakmoon.com/wp-content/uploads/2023/06/image-5.png)

어플리케이션 기능(2)

그 다음으로는 사용자가 어떤 어플리케이션을 사용하고 있는지에 대한 정보를 알아야 한다. 그 정보를 통해 **사용자의 패턴을 알 수 있기 때문**이다. 여기서 **패턴**이란 , 사용자의 앱 사용시간, 눈 깜박임 횟수이다.

![이 이미지는 대체 속성이 비어있습니다. 그 파일 이름은 image-6.png입니다](https://blog.hakmoon.com/wp-content/uploads/2023/06/image-6.png)

어플리케이션 기능(3)

마지막으로는 1번 , 2번 기능을 대시보드 화면으로 볼 수 있게 하는 것입니다. 위 정보를 취합하여 가독성 있게 확인 할 수 있도록 합니다.

데모 버전의 앱 UI를 소개 합니다.

![이 이미지는 대체 속성이 비어있습니다. 그 파일 이름은 image-7.png입니다](https://blog.hakmoon.com/wp-content/uploads/2023/06/image-7.png)

왼쪽부터 (1) 시작페이지 (2) 메인 페이지 (3) 상세 페이지

이제는 앱의 아키텍처에 대해 설명 드리겠습니다.

![이 이미지는 대체 속성이 비어있습니다. 그 파일 이름은 image-8.png입니다](https://blog.hakmoon.com/wp-content/uploads/2023/06/image-8.png)

앱 아키텍처

자세한 앱의 구조를 보여주는 사진입니다.

![이 이미지는 대체 속성이 비어있습니다. 그 파일 이름은 image.png입니다](https://blog.hakmoon.com/wp-content/uploads/2023/06/image.png)

사진에 대해 설명을 하겠습니다. (1) 사용자는 앱을 실행합니다. (2) 앱이 실행되면 Window API를 통해 현재 포어그라운드 프로세스의 변경을 감지합니다. (3) 변경이 감지되면 Face detection 서버와 통신을 하며, 눈 깜박임 데이터를 가져옵니다. (4) 데이터를 DB에 저장합니다.

**데모 영상**

Google drive

github 주소
---------

[https://github.com/jun2mun/DES\_application](https://github.com/jun2mun/DES_application)

**발표 자료**

[발표 자료 PPT 다운로드](https://blog.hakmoon.com/wp-content/uploads/2023/06/소캡톤_발표.pptx)

다운로드 버튼

.editor-styles-wrapper .wp-container-0.wp-container-0 { flex-wrap: nowrap; }