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
def socket_test():
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
    return conn

def socket_recv(conn):
    global cur_cnt
    print('socket accepted, got connection object')
    while 1:
        print("waiting recv data")
        data = conn.recv(1024)
        if data.decode('utf-8') == "start":
            print('count : ',cur_cnt)
            sendTextViaSocket(f'{cur_cnt}',conn)
        time.sleep(1)




def camera():
    global cur_cnt
    
    COUNTER = 0
    TOTAL = 0



    while True:
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




def sendTextViaSocket(message, sock):
    # encode the text message
    encodedMessage = bytes(message, 'utf-8')

    # send the data via the socket to the server
    sock.sendall(encodedMessage)

    # receive acknowledgment from the server
    encodedAckText = sock.recv(1024)
    ackText = encodedAckText.decode('utf-8')

    # log if acknowledgment was successful
    if ackText == ACK_TEXT:
        print('server acknowledged reception of text')
    else:
        print('error: server has sent back ' + ackText)
    # end if
# end function



def while_test1():
    idx = 1
    while 1:
        print("while_test1")
        time.sleep(1)

def while_test():
    idx = 1
    while 1:
        print("while_test")
        time.sleep(1)
    

if __name__ == '__main__':
    print('camera loading...')
    model = blink_detection_model()
    # instancio detector
    detector = f_detector.eye_blink_detector()
    # iniciar variables para el detector de parapadeo
    vs = VideoStream(src=0).start()
    print('camera loaded!!')
    print('socket conn waiting')
    conn = socket_test()
    print('socket connected!!')
    t1 = threading.Thread(target=socket_recv,args=(conn,))
    #t1 = threading.Thread(target=while_test1)
    t2 = threading.Thread(target=camera)
    t1.start()
    t2.start()