import pandas as pd
import matplotlib.pyplot as plt
data = pd.read_csv("./dataset.csv")

def 시간대별_눈_피로도(data):
    times = ['00','02','04','06','08','10','12','14','16','18','20','22','24']
    dataset = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]

    import datetime as dt

    for i,idx in zip(data['start_time'],data.index): # index 하나씩
        #print(i)
        for n in range(len(times)-1): # 시간대 찾기
            if int(times[n]) <= int(i[:2]) < int(times[n+1]): # 시간대 만족
                dataset[n][0] += data.loc[idx]['diff']
                dataset[n][1] += data.loc[idx]['eye_cnt']                            
                #print(data.loc[idx]['diff'],data.loc[idx]['eye_cnt'],dataset[n])
                break

    for idx in range(len(times)-1):
        if dataset[idx][1] != 0:
            print(f'시간대 : {times[idx]}~{times[idx+1]}, 사용시간 : {dataset[idx][0]}, 눈 깜박임 : {dataset[idx][1]} , 눈 비율 : {dataset[idx][1]/dataset[idx][0]}')

    cnt = []
    usage = []
    for idx in range(len(times)):
        a = dataset[idx][1]
        b = dataset[idx][0]
        if b == 0:
            cnt.append(0)
        else:
            cnt.append(a/b)
        usage.append(int(a)/60)


    plt.plot(times,cnt)
    plt.show()

#시간대별_눈_피로도(data)   

def 카테고리별_눈_피로도(data):
    data = data.groupby(['name'])
    data =data.sum()
    data['gradient'] = data['eye_cnt']/data['diff']
    data = data.sort_values(by=['gradient'],ascending=[False])
    data.drop(data[(data['eye_cnt'] == 0)].index,inplace = True)

    type_a = ['main.exe' , 'electron.exe',   'ShellExperienceHost.exe',  'ScreenClippingHost.exe', 'ApplicationFrameHost.exe', 'cmd.exe', 'Taskmgr.exe' ]
    type_b = ['whale.exe', 'chrome.exe','explorer.exe']
    type_c = ['KakaoTalk.exe', 'Discord.exe']
    type_d = ['Code.exe','datagrip64.exe']
    type_list = [type_a,type_b,type_c,type_d]


    temp = 0;cnt = 0
    for type_type in type_list:
        for i in data.index:
            if i in type_type:
                data_ = data.loc[i]['gradient']
                diff_ = data.loc[i]['diff']
                print(f'process name : {i}, 사용시간 : {diff_}, 눈 깜빡임 비율(클수록 좋음) : {data_ }')
                temp += data_
                cnt += 1
        if cnt != 0:
            print(temp / cnt)



def 예측모델():
    # output = 분당 눈 깜빡임 
    # input =  누적 눈 깜빡임 횟수 /  시작 시간대 / 누적 사용시간 / 사용 어플리케이션
    # LSTM 사용 필요 : 시계열 데이터 #
    from keras.models  import Sequential
    from keras.layers import Dense,LSTM
    from numpy import array
    import numpy as np
    start_time = []
    for i in data['start_time']:
        val = int(i[:2])*60*60 + int(i[3:5])*60 + int(i[6:])
        start_time.append(val)
    누적_시간 = data['diff']
    누적_눈깜빡임 = data['eye_cnt']

    x = array([start_time,누적_시간,누적_눈깜빡임])
    x = x.reshape((x.shape[1],x.shape[0],1))
    x = x.astype(np.float32)

    y = []
    for idx in data.index:
        누적_시간 = data.loc[idx]['diff']
        누적_눈깜빡임 = data.loc[idx]['eye_cnt']
        if 누적_눈깜빡임 == 0:
            y.append(0)
        else:
            y.append(누적_눈깜빡임/누적_시간)

    y = array([y])
    y = y.reshape((y.shape[1],))
    y = y.astype(np.float32)


    model = Sequential()
    model.add(LSTM(10,activation = 'relu',input_shape=(3,1)))
    model.add(Dense(5))
    model.add(Dense(1))
    model.summary()

    model.compile(optimizer='adam',loss='mse')
    model.fit(x,y,epochs=10,batch_size=1)

    yhat = model.predict([30000,0.0166665762662888,1])
    print(yhat)
예측모델()