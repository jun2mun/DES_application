import psutil
import time
import datetime as dt
import db_utils
import camera
cur_cnt = 0
loaded = False
class windows_api_process():
    def __init__(self):
        self.SQL = db_utils.internal_DB()
        self.prev_time = None
        self.prev_cnt = None
        self.prev_foreground_pid = None
        self.prev_foreground_name = None
        self.prev_status = False

    def get_foreground_process(self):
        # 윈도우의 포어그라운드 프로세스 ID 가져오기
        try:
            import win32gui
            import win32process
        except ImportError:
            print("win32gui 및 win32process 라이브러리가 설치되어 있지 않습니다.")
            return None

        try:
            # 현재 포커스를 가진 윈도우의 핸들 가져오기
            foreground_window_handle = win32gui.GetForegroundWindow()

            # 포어그라운드 윈도우의 스레드 ID 가져오기
            thread_id, process_id = win32process.GetWindowThreadProcessId(foreground_window_handle)

            # 프로세스 이름 가져오기
            process = psutil.Process(process_id)
            process_name = process.name()

            return process_id,process_name
        except Exception as e:
            #print("포어그라운드 프로세스 ID를 가져오는 동안 오류가 발생했습니다:", str(e))
            #return self.get_foreground_process()
            return None,None

    def count_handler(self):
        pass


    def get_date(self):
        # (name,start_time,end_time,count,date) 프로세스 이름, 시작 시간, 종료 시간, count, 날짜
        cur_date = dt.datetime.now()
        cur_date = cur_date.strftime("%Y-%m-%d")
        return cur_date
    
    def get_time(self):
        cur_time = dt.datetime.now()
        cur_time = cur_time.strftime("%H:%M:%S")
        return cur_time

    def process_handler(self):
        self.prev_time = self.get_time()
        date = self.get_date()
        self.prev_cnt = camera.cur_cnt
        self.prev_foreground_pid,self.prev_foreground_name = self.get_foreground_process()
        self.prev_status = camera.camera_loaded
        while True:
            status = camera.ISAVL
            while True:
                foreground_pid,foreground_name = self.get_foreground_process()
                cur_time = self.get_time()
                if (foreground_name and foreground_name) != None:
                    break
                
            if not status:
                if not self.prev_status : # 감지 x -> 감지 x
                    if self.prev_foreground_pid != foreground_pid:
                        self.prev_foreground_name = foreground_name
                        self.prev_foreground_pid = foreground_pid
                        continue
                    
                else: # 감지 O -> 감지 x
                    self.prev_status = status
                    #if self.prev_foreground_pid != foreground_pid:
                    data = {
                        'name': f'{self.prev_foreground_name}',
                        'start_time' : f'{self.prev_time}',
                        'end_time' : f'{cur_time}',
                        'count' : camera.cur_cnt - self.prev_cnt, 
                        'date' : f'{date}'
                    }
                    print('hi',data)
                    self.foreground_listener(data,camera.camera_loaded)
                    
                    # update
                    self.prev_foreground_name = foreground_name
                    self.prev_foreground_pid = foreground_pid
                    self.prev_time = cur_time
                    self.prev_cnt = camera.cur_cnt
                    date = self.get_date()

                
            if status:
                if not self.prev_status: # 감지 x -> 감지 o
                    self.prev_status = status
                else: # 감지 O -> 감지 O
                    if self.prev_foreground_pid != foreground_pid:
                        data = {
                            'name': f'{self.prev_foreground_name}',
                            'start_time' : f'{self.prev_time}',
                            'end_time' : f'{cur_time}',
                            'count' : camera.cur_cnt - self.prev_cnt, 
                            'date' : f'{date}'
                        }
                        print('hi',data)
                        self.foreground_listener(data,camera.camera_loaded)
                        
                        # update
                        self.prev_foreground_name = foreground_name
                        self.prev_foreground_pid = foreground_pid
                        self.prev_time = cur_time
                        self.prev_cnt = camera.cur_cnt
                        date = self.get_date()

            #if foreground_pid and foreground_name:
            #    print("현재 윈도우 포어그라운드 프로세스의 PID:", foreground_pid)
            #    print("현재 윈도우 포어그라운드 프로세스의 이름:", foreground_name)
            
    def foreground_listener(self,data,boolean: bool):
        print('hi2',data)
        if boolean:
            self.SQL.init()
            self.SQL.INSERT(data)
            pass
    
import threading
# 포어그라운드 프로세스 PID 가져오기
if __name__ == '__main__': 
    api = windows_api_process()
    t2 = threading.Thread(target=camera.camera)
    t3 = threading.Thread(target=api.process_handler)
    #t1.start()
    t2.start()
    t3.start()