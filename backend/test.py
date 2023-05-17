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


def while_test():
    global cur_cnt,process_on
    while 1:
        if not process_on:
            print("while_test,out")
            sys.exit()
        print("while_test")
        cur_cnt += 1
        time.sleep(1)

def socket_recv(sock,conn):
    global process_on
    while 1:
        print("waiting recv data")
        try:
                
            data = conn.recv(1024)
            if data.decode('utf-8') == "start":
                print('count : ',cur_cnt)
                sendTextViaSocket(f'{cur_cnt}',conn)
            elif data.decode('utf-8') == "close":
                print("close request")
                process_on = False
                sys.exit()
            time.sleep(1)
        except socket.error as error:
            if error.errno == errno.WSAECONNRESET:
                sock.close()
                sock,conn = socket_test()

def sendTextViaSocket(message, sock):
    # encode the text message
    encodedMessage = bytes(message, 'utf-8')

    # send the data via the socket to the server
    sock.sendall(encodedMessage)

if __name__ == '__main__':
    print('camera loading...')
    print('camera loaded!!')
    print('socket conn waiting')
    sock,conn = socket_test()
    print('socket connected!!')
    t1 = threading.Thread(target=socket_recv,args=(sock,conn,))
    #t1 = threading.Thread(target=while_test1)
    t2 = threading.Thread(target=while_test)
    t1.start()
    time.sleep(10)
    t2.start()