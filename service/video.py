import time,datetime
import cv2 as cv
import mediapipe as mp
import numpy as np
from utils import draw as utils
from utils.EAR import *
from config import *
import matplotlib.pyplot as plt

# variables 
frame_counter =0
CEF_COUNTER = 0 # ??
TOTAL_BLINKS = 0

# constants 
CLOSED_EYES_FRAME = 3
FONTS =cv.FONT_HERSHEY_COMPLEX
STATUS = ['INIT','ECP','CDP','EOP','LOP','IBI']

map_face_mesh = mp.solutions.face_mesh
camera = cv.VideoCapture('./service/long.mp4')

PARAMETERS=[0.218,0.0023,0.048,0.07,0.08]
MIN_MOVEMENT = 0.02 #TODO 임의
def calculate2db(data):
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
    result += [f'{data[4].timestamp() * 1000}']
def landmarksDetection(img,results,draw=False):
    img_height, img_width = img.shape[:2]
    mesh_coord = [(int(point.x * img_width), int(point.y * img_height)) for point in results.multi_face_landmarks[0].landmark]
    if draw :
        [cv.circle(img, p, 2, utils.GREEN, -1) for p in mesh_coord]
    return mesh_coord     
history = []
with map_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence =0.9,
    static_image_mode = True
    ) as face_mesh:
    # starting time here 
    start_time = time.time()
    prev_time = None
    # starting Video loop here.
    
    ITER_HISTORY = [None for _ in range(5)]
    is_ok = False

    while True:
        frame_counter +=1 # frame counter
        ret, frame = camera.read() # getting frame from camera 
        if not ret: 
            break # no more frames break
        if prev_time == None:
            prev_time = datetime.datetime.now()
        frame.flags.writeable = False ## 필요에 따라 성능 향상을 위해 이미지 작성을 불가능함으로 기본 설정합니다.
        
        #frame = cv.resize(frame, None, fx=1.5, fy=1.5, interpolation=cv.INTER_CUBIC)
        frame_height, frame_width= frame.shape[:2]

        #frame =utils.textWithBackground(frame,f'FPS: {round(fps,1)}',FONTS, 1.0, (20, 50), bgOpacity=0.9, textThickness=2)
        rgb_frame = cv.cvtColor(frame, cv.COLOR_RGB2BGR)
        results  = face_mesh.process(rgb_frame)
        
        if results.multi_face_landmarks: # 얼굴 감지될때 (TODO 눈만 가릴때도 Blink 처리 되는거 해결 필요.)
            mesh_coords = landmarksDetection(frame, results, False)
            ratio,rightEAR,leftEAR = blinkRatio(frame,mesh_coords,RIGHT_EYE,LEFT_EYE)
            
            utils.colorBackgroundText(frame,  f'Ratio : {round(ratio,2)}', FONTS, 0.7, (30,100),2, utils.PINK, utils.YELLOW)
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
                calculate2db(ITER_HISTORY)
                ITER_HISTORY = [None for _ in range(5)]
                




            if ratio < 0.22:
                CEF_COUNTER +=1
                # cv.putText(frame, 'Blink', (200, 50), FONTS, 1.3, utils.PINK, 2)
                utils.colorBackgroundText(frame,  f'Blink', FONTS, 1.7, (int(frame_height/2), 100), 2, utils.YELLOW, pad_x=6, pad_y=6, )
            else:
                if CEF_COUNTER>CLOSED_EYES_FRAME:
                    TOTAL_BLINKS +=1
                    CEF_COUNTER =0
            # cv.putText(frame, f'Total Blinks: {TOTAL_BLINKS}', (100, 150), FONTS, 0.6, utils.GREEN, 2)
            utils.colorBackgroundText(frame,  f'Total Blinks: {TOTAL_BLINKS}', FONTS, 0.7, (30,150),2)
            
            #cv.polylines(frame,  [np.array([mesh_coords[p] for p in LEFT_EYE ], dtype=np.int32)], True, utils.GREEN, 1, cv.LINE_AA)
            #cv.polylines(frame,  [np.array([mesh_coords[p] for p in RIGHT_EYE ], dtype=np.int32)], True, utils.GREEN, 1, cv.LINE_AA)

            # Blink Detector Counter Completed
            right_coords = [mesh_coords[p] for p in RIGHT_EYE]
            left_coords = [mesh_coords[p] for p in LEFT_EYE]
            crop_right, crop_left = eyesExtractor(frame, right_coords, left_coords)
            cv.imshow('right', crop_right)
            cv.imshow('left', crop_left)
            eye_position, color = positionEstimator(crop_right)
            utils.colorBackgroundText(frame, f'R: {eye_position}', FONTS, 1.0, (40, 220), 2, color[0], color[1], 8, 8)
            eye_position_left, color = positionEstimator(crop_left)
            utils.colorBackgroundText(frame, f'L: {eye_position_left}', FONTS, 1.0, (40, 320), 2, color[0], color[1], 8, 8)
            
            

        # calculating  frame per seconds FPS
        #end_time = time.time()-start_time
        #fps = frame_counter/end_time
        #frame =utils.textWithBackground(frame,f'FPS: {round(fps,1)}',FONTS, 1.0, (30, 50), bgOpacity=0.9, textThickness=2)
        
        #좌우반전 cv2.imshow('MediaPipe Face Mesh(Puleugo)', cv2.flip(image, 1))
        cv.imshow('frame', frame)
        
        key = cv.waitKey(1)
        if key==ord('q') or key ==ord('Q'):
            break
    
    
    
    
    
    
    cv.destroyAllWindows()
    camera.release()


print(
    np.var(history),
    np.mean(history),
    np.std(history)
)
#import seaborn as sns
#sns.displot(history,kind="kde")
#plt.show()

