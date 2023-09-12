###################################
  #### eye detection library ####
from imutils.video import VideoStream
import cv2
from eye_api.dlib_model import blink_detection_model
import imutils
from eye_api import f_detector
import numpy as np
####################################

cur_cnt = 0
camera_loaded = False
ISAVL = False

def camera():
    global cur_cnt,camera_loaded,ISAVL
    
    COUNTER = 0
    TOTAL = 0

    print('camera loading...')

    detector = f_detector.eye_blink_detector()
    # iniciar variables para el detector de parapadeo
    vs = VideoStream(src=0).start()
    camera_loaded = True
    while True:
        im = vs.read()

        im = cv2.flip(im, 1)
        im = imutils.resize(im, width=720)
        gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
        # detectar_rostro    
        rectangles = detector.detector_faces(gray, 0)
        boxes_face = f_detector.convert_rectangles2array(rectangles,im)
        if len(boxes_face)!=0:
            # seleccionar el rostro con mas area
            areas = f_detector.get_areas(boxes_face)
            index = np.argmax(areas)
            rectangles = rectangles[index]
            boxes_face = np.expand_dims(boxes_face[index],axis=0)
            # blinks_detector
            COUNTER,TOTAL = detector.eye_blink(gray,rectangles,COUNTER,TOTAL)
            ISAVL = True
            #img_post = f_detector.bounding_box(im,boxes_face,['blinks: {}'.format(TOTAL)])
            #print("count : " ,TOTAL)
        else:
            img_post = im
            #print("not detected",TOTAL)
            ISAVL = False
        cur_cnt = TOTAL
        #cv2.imshow('blink_detection',img_post)
        #if cv2.waitKey(1) &0xFF == ord('q'):
        #    break