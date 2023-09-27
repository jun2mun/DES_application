import sqlite3
import os
#TODO connection pool 사용할것인지 고려 필요
class internal_DB(object):
    # DB 연결
    def __init__(self):
        self.conn = None
        self.Cur = None

    def create(self):
        pass
    def init(self,name='test',custom = f'CREATE TABLE process(id INTEGER PRIMARY KEY,EAR Integer, count1min Integer, groupid text, date text, start_time text, end_time text)'):
        file_name = f'./second_{name}.db'
        if os.path.isfile(file_name):
            self.conn = sqlite3.connect(file_name)

            self.Cur = self.conn.cursor()
        else:
            self.conn = sqlite3.connect(file_name)

            self.Cur = self.conn.cursor()
            self.CREATE(custom)


    def CREATE(self,sql = f'CREATE TABLE process(id INTEGER PRIMARY KEY,EAR Integer, count1min Integer, groupid text, date text, start_time text, end_time text)'):
        # 1분간 눈깜빡임 | 연속그룹 | 날짜 | 측정 시간대
        try:
            sql = sql
            self.Cur.execute(sql)
        except Exception as e:
            print('error',e)
        finally:
            self.conn.commit()

    def SELECT(self,query=None):
        try:
            sql = f'select * from process'
            self.Cur.execute(sql)
        except Exception as e:
            print('error',e)
        finally:
            self.conn.commit()

    def INSERT(self,data):
        COLUMNS = [key for key in data.keys()]
        VALUES = [data[val] for val in COLUMNS] 
        COLUMNS = ','.join(COLUMNS)

        for idx in range(len(VALUES)):
            if type(VALUES[idx]) == str:
                VALUES[idx] = "\"" + VALUES[idx] + "\""
            elif type(VALUES[idx]) == int or float:
                VALUES[idx] = str(VALUES[idx])
        
        VALUES = ','.join(VALUES)
        #print(VALUES)

        try:
            sql = f'INSERT INTO process ({COLUMNS}) VALUES ({VALUES})'
            self.Cur.execute(sql)
        except Exception as e:
            print('error',e)
        finally:
            self.conn.commit()

#instance = internal_DB()
#instance.init('main')
#instance.CREATE()
#instance.SELECT()