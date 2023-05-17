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
    return sock,conn

def socket_recv(sock,conn):
    global cur_cnt
    print('socket accepted, got connection object')
    while 1:
        print("waiting recv data")
        data = conn.recv(1024)
        if data.decode('utf-8') == "start":
            print('count : ',cur_cnt)
            
        elif data.decode('utf-8') == "close":
            exit()
        time.sleep(1)

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
    sock,conn = socket_test()
    print('socket connected!!')
    t1 = threading.Thread(target=socket_recv,args=(sock,conn,))
    #t1 = threading.Thread(target=while_test1)
    t2 = threading.Thread(target=while_test)
    t1.start()
    t2.start()