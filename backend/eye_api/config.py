import os,sys
# define two constants, one for the eye aspect ratio to indicate
# blink and then a second constant for the number of consecutive
# frames the eye must be below the threshold
#EYE_AR_THRESH = 0.23 #baseline
#EYE_AR_CONSEC_FRAMES = 3

EYE_AR_THRESH = 0.14 # 눈 사이 길이(안경쓰면)
#EYE_AR_THRESH = 0.23 # 안경안쓰면
RATIO_THRESH = 0.0017
EYE_AR_CONSEC_FRAMES = 1 # baseline(3) 정도 시간만큼 눈 사이길이가 나옴
## TODO 문제점 : 사선을 응시할 경우 ## 제대로 측정이 안됨
if getattr(sys, 'frozen', False):
    APPLICATION_EXE_DIR = os.path.dirname(sys.executable)
    eye_landmarks = APPLICATION_EXE_DIR.replace('\\','/')+"/eye_api/model_landmarks/shape_predictor_68_face_landmarks.dat"
    
else:
    eye_landmarks = os.path.dirname(os.path.abspath(__file__).replace('\\','/'))+"/model_landmarks/shape_predictor_68_face_landmarks.dat"

#eye_landmarks = "backend/eye_api/model_landmarks/shape_predictor_68_face_landmarks.dat"
# initialize the frame counters and the total number of blinks
COUNTER = 0
TOTAL = 0