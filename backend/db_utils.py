import sqlite3
#TODO connection pool 사용할것인지 고려 필요
class internal_DB(object):
    # DB 연결
    def __init__(self):
        self.conn = None
        self.Cur = None

    def init(self):
        self.conn = sqlite3.connect('./test.db')
        self.Cur = self.conn.cursor()

    def INSERT(self,data):
        COLUMNS = [key for key in data.keys()]
        VALUES = [data[val] for val in COLUMNS] 
        COLUMNS = ','.join(COLUMNS)

        for idx in range(len(VALUES)):
            if type(VALUES[idx]) == str:
                VALUES[idx] = "\"" + VALUES[idx] + "\""
            elif type(VALUES[idx]) == int:
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



            