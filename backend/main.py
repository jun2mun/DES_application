from flask import Flask
from eye_api.dlib_model import blink_detection_model
import requests
from threading import Thread
import subprocess
app = Flask(__name__)
model = blink_detection_model()
@app.route('/')
def home():
    return 'wrong request'

@app.route('/start',methods=['GET'])
def blink_detect():
    #if requests.request.method == 'POST':
    model.start()
    return ''
    #return ''

@app.route('/stop',methods=['GET'])
def stoped():
    #if requests.request.method == 'POST':
    model.terminate()
    return f'{model.TOTAL} 이 나왔습니다.!!'
    #return ''

if __name__ == '__main__':
    app.run('0.0.0.0',port=5000,debug=True)
    