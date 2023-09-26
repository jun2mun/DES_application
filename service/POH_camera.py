import time
import cv2 as cv
import mediapipe as mp
import numpy as np
from utils import draw as utils
from utils.EAR import *
from config import *
import datetime

# variables 
frame_counter =0
CEF_COUNTER = 0 # ??
TOTAL_BLINKS = 0
FACE_DETECT = 0
EYE_RAITO_BOUNDARY = 0.13
ratio = 0
# constants 
CLOSED_EYES_FRAME = 2
FONTS =cv.FONT_HERSHEY_COMPLEX


map_face_mesh = mp.solutions.face_mesh
camera = cv.VideoCapture(0)
PARAMETERS=[0.218,0.0023,0.048,0.07,0.08]
MIN_MOVEMENT = 0.02 #TODO 임의
result = []
def calculate2db(data,history):
    global result
    result = [0,0,0] # ecp,cdp,eop // IBI는 SQL에서
    print('datetime 변경')
    if data[1] != None and data[2] != None:
        result[0] = (data[2] - data[1]).total_seconds() / 100

    elif data[2] != None and data[3] != None:
        result[1] = (data[3] - data[2]).total_seconds() / 100

    elif data[3] != None and data[4] != None:
        result[2] = (data[4] - data[3]).total_seconds() / 100
    
    for i in result:
        if i == 0:
            result[i] = MIN_MOVEMENT
        else:
            result += [f'{i.timestamp()*1000}']
    result += [f'{data[4].timestamp() * 1000}']
    result += [history]

def landmarksDetection(img,results,draw=False):
    img_height, img_width = img.shape[:2]
    mesh_coord = [(int(point.x * img_width), int(point.y * img_height)) for point in results.multi_face_landmarks[0].landmark]
    return mesh_coord     

def Blink_detect_process():
    global frame_counter,CEF_COUNTER,TOTAL_BLINKS,CLOSED_EYES_FRAME,FONTS,FACE_DETECT,ratio
    with map_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence =0.5, 
        min_tracking_confidence=0.5) as face_mesh:

        # starting Video loop here.
        while True:
            frame_counter +=1 # frame counter
            ret, frame = camera.read() # getting frame from camera 
            if not ret: 
                break # no more frames break

            frame.flags.writeable = False ## 필요에 따라 성능 향상을 위해 이미지 작성을 불가능함으로 기본 설정합니다.
            
            rgb_frame = cv.cvtColor(frame, cv.COLOR_RGB2BGR)
            results  = face_mesh.process(rgb_frame)

            if results.multi_face_landmarks:
                FACE_DETECT = 1
                mesh_coords = landmarksDetection(frame, results, False)
                ratio,rightEAR,leftEAR = blinkRatio(frame,mesh_coords,RIGHT_EYE,LEFT_EYE)
                if rightEAR > 5.0 or leftEAR > 5.0: # 한쪽 눈이 측정 안될 경우(정상적으로 maybe TODO 임의임)
                    FACE_DETECT = 0
                    continue
                
                history += [ratio]
        

                POH_MEAN,POH_VAR,POH_STD,눈감았다_기준,눈뜨는_기준 = PARAMETERS
                POH_CRITERIA = [POH_MEAN-POH_STD,POH_MEAN,POH_MEAN+POH_STD] #최소,최대
                
                
                POH = ratio # 현재 눈 비율
                
                #예외처리

                # STATUS = ['init','ECP','CDP','EOP','IBI','n_ECP']
                is_ok = False
                
                #ITER_HISTORY = [시작, ecp, cdp, eop, 정상, 다음_시작]
                # IMI 구역 or INIT 구역
                if POH >= POH_CRITERIA[0]:
                    # IMI 
                    # IMI 구역
                    if ITER_HISTORY[0] == None:
                        ITER_HISTORY[0] = datetime.datetime.now()
                    if ITER_HISTORY[0] != None and ITER_HISTORY[4] == None and (ITER_HISTORY[1] !=None or ITER_HISTORY[2] !=None or ITER_HISTORY[3] !=None):
                        ITER_HISTORY[4] = datetime.datetime.now()
                        is_ok = True
                    
                if POH < POH_CRITERIA[0]: # 100 프로 이하
                    if 눈감았다_기준 < POH < POH_CRITERIA[0]: # ECP,EOP 구역
                        if ITER_HISTORY[1] == None and ITER_HISTORY[2] == None: # CDP를 지났으면 EOP
                            ITER_HISTORY[1] = datetime.datetime.now()
                        if ITER_HISTORY[1] != None and ITER_HISTORY[3] == None:
                            ITER_HISTORY[3] = datetime.datetime.now()
                        
                    elif POH <= 눈감았다_기준: # CDP 구역
                        if ITER_HISTORY[2] == None:
                            ITER_HISTORY[2] = datetime.datetime.now()


                if is_ok:
                    print('ok',ITER_HISTORY)
                    calculate2db(ITER_HISTORY,history)
                    ITER_HISTORY = [None for _ in range(5)]
                    history = []




                if ratio < EYE_RAITO_BOUNDARY:
                    CEF_COUNTER +=1
                else:
                    if CEF_COUNTER>CLOSED_EYES_FRAME:
                        TOTAL_BLINKS +=1
                        CEF_COUNTER =0
            else:
                FACE_DETECT = 0
        cv.destroyAllWindows()
        camera.release()
