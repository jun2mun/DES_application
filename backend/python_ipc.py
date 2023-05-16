###################################
        #### 소켓 통신 ####
import socket
import time

HOST = '127.0.0.1'
PORT = 65439
###################################

###################################
  #### eye detection library ####
from imutils.video import VideoStream
import cv2
from eye_api.dlib_model import blink_detection_model
import imutils
from eye_api import f_detector
import numpy as np
####################################

####################################
#### 멀티 쓰레드 ####
import threading
import queue

####################################


queue = queue.Queue()
def main():

    model = blink_detection_model()
    # instancio detector
    detector = f_detector.eye_blink_detector()
    # iniciar variables para el detector de parapadeo

    COUNTER = 0
    TOTAL = 0
    quit = False

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
    conn, addr = sock.accept()      # Note: execution waits here until the client calls sock.connect()
    print('socket accepted, got connection object')

    vs = VideoStream(src=0).start()


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


        print(f'socket is : {conn.recv(1024)}')


    myCounter = 0
    while True:        
        message = 'message ' + str(myCounter)
        print('sending: ' + message)
        sendTextViaSocket(message, conn)
        myCounter += 1
        time.sleep(1)
    # end while
# end function

def socket_server(queue):
    print("socket_server",queue.get())
    COUNTER = 0
    TOTAL = 0
    quit = False

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
    conn, addr = sock.accept()      # Note: execution waits here until the client calls sock.connect()
    print('socket accepted, got connection object')

    data = conn.recv(1024)
    queue.put(data)
    print(f'socket is : {data}')


    myCounter = 0
    while True:        
        message = 'message ' + str(myCounter)
        print('sending: ' + message)
        sendTextViaSocket(message, conn)
        myCounter += 1
        time.sleep(1)
    # end while
# end function


def camera(queue):
    print("camera",queue.get())
    model = blink_detection_model()
    # instancio detector
    detector = f_detector.eye_blink_detector()
    # iniciar variables para el detector de parapadeo

    COUNTER = 0
    TOTAL = 0

    vs = VideoStream(src=0).start()


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




if __name__ == '__main__':
    t1 = threading.Thread(target=socket_server,args=(queue,))
    t2 = threading.Thread(target=camera,args=(queue,))
    t1.start()
    print("t1 start")
    t2.start()
    print("t2 start")
    