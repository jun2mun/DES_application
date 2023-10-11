import time
import cv2 as cv
import mediapipe as mp
import numpy as np
from utils import draw as utils
from utils.EAR import *
from config import *

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
allover = False


map_face_mesh = mp.solutions.face_mesh
num = '001'

#camera = cv.VideoCapture(f'X:/ai/Training/0e23d546a5f952542a00/0e23d546a5f952542a00_{num}.mp4')

def convert_num(number):
    number = int(number)
    number = str(number)
    if len(number) == 1:
        number = '00' + number
    elif len(number) == 2:
        number = '0' + number
    return number


def landmarksDetection(img,results,draw=False):
    img_height, img_width = img.shape[:2]
    mesh_coord = [(int(point.x * img_width), int(point.y * img_height)) for point in results.multi_face_landmarks[0].landmark]
    return mesh_coord     

def Blink_detect_process():
    global frame_counter,CEF_COUNTER,TOTAL_BLINKS,CLOSED_EYES_FRAME,FONTS,FACE_DETECT,ratio,allover,camera,num
    with map_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence =0.5, 
        min_tracking_confidence=0.5) as face_mesh:
        for num in range(1,185):
            num = convert_num(num)
            camera =cv.VideoCapture(f'X:/ai/Training/026f9b9514f28f37a3fd/026f9b9514f28f37a3fd_{num}.mp4') #108 부터 시작
            print(camera,num)
            # starting Video loop here.
            while True:
                frame_counter +=1 # frame counter
                ret, frame = camera.read() # getting frame from camera 
                if not ret: 
                    allover = True
                    print('exit the camera')
                    cv.destroyAllWindows()
                    camera.release()

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
                    
                    if ratio < EYE_RAITO_BOUNDARY:
                        CEF_COUNTER +=1
                    else:
                        if CEF_COUNTER>CLOSED_EYES_FRAME:
                            TOTAL_BLINKS +=1
                            CEF_COUNTER =0
                else:
                    FACE_DETECT = 0
