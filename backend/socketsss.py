"""
import socket
from _thread import *

HOST = 'localhost'
PORT = 5000


client_socket = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
client_socket.connect((HOST,PORT))

def recv_data(client_socket):
    while True:
        data = client_socket.recv(1024)
        print("recv :",repr(data.decode()))
    
start_new_thread(recv_data,(client_socket,))
print(">> connect Server")

while True:
    message = input('')
    if message == 'quit':
        close_Data = message
        break

    client_socket.send(message.encode())

client_socket.close()

"""