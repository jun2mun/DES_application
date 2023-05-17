import socket
import select
import time

HOST = '127.0.0.1'
PORT = 65439

ACK_TEXT = 'text_received'
###################################
  #### eye detection library ####
from imutils.video import VideoStream
import cv2
from eye_api.dlib_model import blink_detection_model
import imutils
from eye_api import f_detector
import numpy as np
####################################

import queue
import threading
cur_cnt = 0
import socket
import select
import time
import errno
import threading
import sys

HOST = '127.0.0.1'
PORT = 65439
cur_cnt = 0
process_on = True
camera_loaded = False
is_camera = False

def socket_init():
    # instantiate a socket object
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print('socket instantiated')

    # bind the socket
    sock.bind((HOST, PORT))
    print('socket binded')

    # start the socket listening
    sock.listen()
    print('socket now listening')

    # accept the socket response from the client, and get the connection object
    conn, addr = sock.accept()    # Note: execution waits here until the client calls sock.connect()
    return sock,conn

def socket_func(sock,conn):
    global process_on
    while 1:
        print("waiting recv data")
        try:
                
            data = conn.recv(1024)
            if data.decode('utf-8') == "start":
                if is_camera == False:
                    sendTextViaSocket(f'0',conn) # 카메라 없으면 그때 동안은 0(카메라 없음)으로 측정
                else:
                    if camera_loaded:    
                        print('count : ',cur_cnt)
                        sendTextViaSocket(f'{cur_cnt}',conn)
                    else:
                        sendTextViaSocket(f'camera loading',conn) # 카메라 없으면 그때 동안은 0(카메라 없음)으로 측정
            elif data.decode('utf-8') == "close":
                print("close request")
                sendTextViaSocket(f'close request',conn)
                process_on = False
                sys.exit()
            time.sleep(1)
        except socket.error as error:
            if error.errno == errno.WSAECONNRESET:
                sock.close()
                sock,conn = socket_init()

def sendTextViaSocket(message, sock):
    # encode the text message
    encodedMessage = bytes(message, 'utf-8')

    # send the data via the socket to the server
    sock.sendall(encodedMessage)



def camera():
    global cur_cnt,is_camera,camera_loaded
    
    COUNTER = 0
    TOTAL = 0

    print('camera loading...')

    detector = f_detector.eye_blink_detector()
    # iniciar variables para el detector de parapadeo
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("no camera detected")
        is_camera = False
        sys.exit()
    else:
        vs = VideoStream(src=0).start()
        is_camera = True
        camera_loaded = True
        
    print('camera is ',vs)
    print('camera loaded!!')

    while True:
        if not process_on:
            print("while_test,out")
            sys.exit()
        star_time = time.time()
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
        
        else:
            img_post = im
        print("count : " ,TOTAL)
        cur_cnt = TOTAL




    

if __name__ == '__main__': 
    print('socket conn waiting')
    sock,conn = socket_init()
    print('socket connected!!')
    t1 = threading.Thread(target=socket_func,args=(sock,conn,))
    #t1 = threading.Thread(target=while_test1)
    t2 = threading.Thread(target=camera)
    t1.start()
    t2.start()