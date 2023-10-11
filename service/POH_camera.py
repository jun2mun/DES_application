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
import re


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
camera = cv.VideoCapture('X:/ai/Training/0e23d546a5f952542a00/0e23d546a5f952542a00_001.mp4')



def monitoring():
    global event,work_queue

    SQL = db_utils.internal_DB()
    SQL.connect(name='EAR_detail')
    SQL.CREATE(f'CREATE TABLE HISTORY(EAR_ID TEXT, EAR text,DATE text,TIME text,SECOND text)')
    SQL.CREATE(f'CREATE TABLE SEQUENCE(ID INTEGER PRIMARY KEY,A text, B text, E text, EAR_ID TEXT)')

    prev_EAR = None; EAR = None; dictionary = ['눈감는중','눈 뜨는중']; status = 'Fall'
    EAR_dictionary = [0.28,0.178,0.08]
    data = []; history = []; status_list = []
    while True:
        #print(EAR,prev_EAR)
        if work_queue: # 카메라에서 EAR이 측정되어야 모니터링
            #print(f'event acquired!! & EAR is : {EAR}')
            #lock.acquire() # 작업이 끝나기 전까지 다른 쓰레드가 공유데이터 접근을 금지
            #print(work_queue)
            EAR,cur_time = work_queue.popleft()
            #'2023-10-02 10:26:35.180816'
            cur_time = re.sub('[-:]', '', cur_time)
            if (prev_EAR == None and EAR != None):
                prev_EAR = EAR

            if (prev_EAR > EAR):
                status = 'Fall'
            elif (prev_EAR < EAR):
                status = 'UPPER'
            # EAR 같으면 상태 변화 X
            history += [[EAR,cur_time]]
            # 데이터가 100%보다 낮아지면 : ‘현재 시간’ | A
            if EAR >= EAR_dictionary[1] and status == 'Fall':
                pass # 아무것도 일어나지 않는 곳
            if EAR_dictionary[1] >= EAR and status == 'Fall' and len(data) == 0:
                data += [['A',datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')]] # 저장 A
                status_list += ['A']
            if EAR_dictionary[2] > EAR and status == 'Fall'  and len(data) == 1:
                data += [['B',datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')]] # 저장 B
                status_list += ['B']
            ## EOP,LOP는 측정이 안되는 경우가 많음 ##
            #if EAR_dictionary[3] >= EAR >= EAR_dictionary[2] and status == 'UPPER'  and len(data) == 2:
            #    data += [['C',datetime]] # 저장 C
            #if EAR_dictionary[4] >= EAR >= EAR_dictionary[3] and status == 'UPPER'  and len(data) == 3:
            #    data += [['D',datetime]] # 저장 D
            if EAR >= EAR_dictionary[1] and status == 'UPPER'  and (len(data) == 1 or len(data) == 2):
                data += [['E',datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')]] # 저장 E
                status_list += ['E']

            ##
            #print(status_list)  
            if len(data) >= 2:
                timestamp = time.time()
                ID_UUID = str(timestamp)
                if data[0][0] == 'A' and data[1][0] == 'E': # 비정상 종료
                    print('비정상 깜박')
                    data = {
                        'A' : data[0][1],
                        'E' : data[1][1],
                        'EAR_ID' : ID_UUID
                    }
                    #{timestamp_date},{timestamp_time[:6]},{timestamp_time[6:]} DATE,TIME,SECOND
                    # '20231002 102635 180816'
                    history = [(ID_UUID,value_EAR,value_timestamp[:8],value_timestamp[9:15],value_timestamp[15:]) for value_EAR,value_timestamp in history]
                    
                    COLUMNS = [key for key in data.keys()]
                    VALUES = [data[val] for val in COLUMNS] 
                    COLUMNS = ','.join(COLUMNS)

                    for idx in range(len(VALUES)):
                        if type(VALUES[idx]) == str:
                            VALUES[idx] = "\"" + VALUES[idx] + "\""
                        elif type(VALUES[idx]) == int or float:
                            VALUES[idx] = str(VALUES[idx])
                    
                    VALUES = ','.join(VALUES)
                    #print(VALUES)
                    try:
                        SQL.Cur.execute(f'INSERT INTO SEQUENCE ({COLUMNS}) VALUES ({VALUES})')                     
                        SQL.Cur.executemany(f'INSERT INTO HISTORY VALUES (?,?,?,?,?)',history)
                    except Exception as e:
                        print('error',e)
                    finally:
                        SQL.conn.commit()
                    #DB.insert()
                    data = []; history = [];status_list =[]
                elif len(data) == 3: # 정상 종료
                    print('정상 깜박')
                    data = {
                        'A' : data[0][1],
                        'B' : data[1][1],
                        'E' : data[2][1],
                        'EAR_ID' : ID_UUID
                    }
                    history = [(ID_UUID,value_EAR,value_timestamp[:8],value_timestamp[9:15],value_timestamp[15:]) for value_EAR,value_timestamp in history]


                    COLUMNS = [key for key in data.keys()]
                    VALUES = [data[val] for val in COLUMNS] 
                    COLUMNS = ','.join(COLUMNS)

                    for idx in range(len(VALUES)):
                        if type(VALUES[idx]) == str:
                            VALUES[idx] = "\"" + VALUES[idx] + "\""
                        elif type(VALUES[idx]) == int or float:
                            VALUES[idx] = str(VALUES[idx])
                    
                    VALUES = ','.join(VALUES)
                    #print(VALUES)
                    try:
                        SQL.Cur.execute(f'INSERT INTO SEQUENCE ({COLUMNS}) VALUES ({VALUES})')
                        SQL.Cur.executemany(f'INSERT INTO HISTORY VALUES (?,?,?,?,?)',history)
                    except Exception as e:
                        print('error',e)
                    finally:
                        SQL.conn.commit()

                    data = []; history = [];status_list =[]

 

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
                print('camera out')
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