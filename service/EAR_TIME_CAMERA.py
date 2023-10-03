import time
import cv2 as cv
import mediapipe as mp
import numpy as np
from utils.EAR import *
from config import *
import datetime
from utils import db_utils
from collections import deque
import threading


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

work_queue = deque([])


map_face_mesh = mp.solutions.face_mesh
camera = cv.VideoCapture(0)

def monitoring():
    global event,work_queue
    SQL = db_utils.internal_DB()
    prev_EAR = None; EAR = None; dictionary = ['눈감는중','눈 뜨는중']; status = 'Fall'
    EAR_dictionary = [0.28,0.178,0.08]
    data = []; history = []; status_list = []
    while True:
        if work_queue: # 카메라에서 EAR이 측정되어야 모니터링
            EAR = work_queue.popleft()  
            SQL.init(name='EAR_detail',custom=f'CREATE TABLE SEQUENCE(ID INTEGER PRIMARY KEY,A text, B text, E text, EAR_ID TEXT)')
            SQL.CREATE(f'CREATE TABLE HISTORY(EAR_ID TEXT, EAR text)')
            SQL.INSERT(data)
            SQL.INSERTMANY(sql = f'INSERT INTO HISTORY VALUES (?,?)',history = history)
        
            #lock.release() # lock 해제`
        # camera 끝나면
        else:
            #print('not detect')
            pass

def landmarksDetection(img,results,draw=False):
    img_height, img_width = img.shape[:2]
    mesh_coord = [(int(point.x * img_width), int(point.y * img_height)) for point in results.multi_face_landmarks[0].landmark]
    return mesh_coord     

def Blink_detect_process():
    global frame_counter,CEF_COUNTER,TOTAL_BLINKS,CLOSED_EYES_FRAME,FONTS,FACE_DETECT,ratio
    global EAR,event,work_queue
    with map_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence =0.5, 
        min_tracking_confidence=0.5) as face_mesh:
        # starting Video loop here.
        
        while True:
            event = False
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
                
                ## GLOBAL 변수 ##
                work_queue.append([ratio,datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')])
                #################
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


# 포어그라운드 프로세스 PID 가져오기
if __name__ == '__main__': 
    t2 = threading.Thread(target=Blink_detect_process)
    #t3 = threading.Thread(target=api.initial)
    t4 = threading.Thread(target=monitoring)
    t2.start()
    t4.start()
    #t3.start()