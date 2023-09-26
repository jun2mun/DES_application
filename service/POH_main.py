from utils import db_utils
import POH_camera as camera
import datetime as dt
import os
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Blink_API():
    def __init__(self):
        self.SQL = db_utils.internal_DB()
        self.prev_time = None
        self.start2check = True
        self.prev_cnt = None
        self.stack_cnt = 0
        self.stack_time = 0

    def initial(self):
        self.prev_cnt = camera.TOTAL_BLINKS
        cur_info = dt.datetime.now()
        self.time_handler()

    def get_time(self):
        cur_time = dt.datetime.now()
        cur_time = cur_time.strftime("%H:%M:%S")
        return cur_time

    def get_date(self):
        # (name,start_time,end_time,count,date) 프로세스 이름, 시작 시간, 종료 시간, count, 날짜
        cur_date = dt.datetime.now()
        cur_date = cur_date.strftime("%Y-%m-%d")
        
        return cur_date
      
    def frame_handler(self):    
        #thread_time_checker = threading.Timer(1,api.time_handler)
        #thread_time_checker.start()
        history = [];time_table=[]
        stack_time = 0
        start_time = dt.datetime.now()
        while True:
            cur_info = dt.datetime.now()
            cur_date = cur_info.strftime("%Y%m%d%H%M")
            cur_date = cur_date[:-1] + 'x'
            if self.start2check:
                self.prev_time = cur_info.strftime("%H:%M:%S")
                self.start2check = False
            status = camera.FACE_DETECT
            cur_ratio = camera.ratio


            if self.prev_cnt == None:
                self.prev_cnt = camera.TOTAL_BLINKS
            if status:
                print('status',self.stack_time,self.stack_cnt,self.prev_cnt,camera.TOTAL_BLINKS)
                
                ecp,cdp,eop,next_IBI_end,prev_IBI_start,history = camera.result


                data = {
                        'ecp' : f'{ecp}',
                        'cdp' : f'{cdp}',
                        'eop' : f'{eop}',
                        'next_IBI_end' : f'{next_IBI_end}',
                        'prev_IBI_start' : f'{prev_IBI_start}'
                    }
                
                self.prev_cnt = camera.TOTAL_BLINKS
                self.start2check = True
                self.stack_time = 0; self.stack_cnt = 0
                self.SQL.init(name='EARSS',custom=f'CREATE TABLE process(EAR_ID INTEGER PRIMARY KEY,ecp text, cdp text, eop text, next_IBI_end text, prev_IBI_start text)')
                self.SQL.INSERT(data)

                    
            else:
                diff_cnt = camera.TOTAL_BLINKS - self.prev_cnt
                self.prev_cnt = camera.TOTAL_BLINKS
                self.stack_cnt += diff_cnt




import threading
# 포어그라운드 프로세스 PID 가져오기
if __name__ == '__main__': 
    api = Blink_API()
    t2 = threading.Thread(target=camera.Blink_detect_process)
    #t3 = threading.Thread(target=api.initial)
    t4 = threading.Thread(target=api.frame_handler)
    t2.start()
    t4.start()
    #t3.start()