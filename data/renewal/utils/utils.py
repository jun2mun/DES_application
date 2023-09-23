import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def raw_train_test_split(dataset="./data/renewal/main.csv",seq_len = 10):
    # 정상 데이터

    total_raw_data = pd.read_csv("./data/renewal/main.csv")
    before_preprocess_total_data_list = total_raw_data['count'].values.tolist()
    total_data_list = []
    for i in before_preprocess_total_data_list:
        if 10 <= i <= 29:
            total_data_list.append(i)
    ## 전처리
    X = []; seq_len = 10
    for i in range(len(total_data_list) - seq_len):
        X.append(total_data_list[i:(i+seq_len)])

    total_data_count = len(X)
    X = np.array(X).reshape(-1,10)
    X = X.astype('float32')
    total_data_train = X[:int(total_data_count*0.8)]
    total_data_test = X[int(total_data_count*0.8):]

    ## 테스트 검증 데이터 만들기
    total_test_tot = np.hstack((total_data_test,np.zeros(total_data_test.shape[0]).reshape(-1,1))) # 

    #x_test,x_valid,y_test,y_valid = train_test_split(total_test_tot[:,:-1],total_test_tot[:,-1],test_size=0.3)
    x_test,x_valid,y_test,y_valid = train_test_split(total_test_tot[:,:-1],total_test_tot[:,-1],test_size=0.3)
    #print(x_test.shape,y_test.shape) 9길이 -> 10일차 예측
    #print(x_test,y_test)
    return total_raw_data,total_data_train,total_data_test,total_test_tot, x_test,x_valid,y_test,y_valid


def standardlize(total_data_train,total_data_test,total_test_tot, x_test,x_valid,y_test,y_valid):
    # 정규화(z-score)
    stder = StandardScaler()
    stder.fit(total_data_train)
    x_total_train_scaled = stder.transform(total_data_train)
    x_test_scaled = stder.transform(x_test)
    x_valid_scaled = stder.transform(x_valid)

    # LSTM 입력 데이터 형태로 차원 변경
    x_total_train_scaled = x_total_train_scaled.reshape(x_total_train_scaled.shape[0],x_total_train_scaled.shape[1],1)
    x_test_scaled = x_test_scaled.reshape(x_test_scaled.shape[0],x_test_scaled.shape[1],1)
    x_valid_scaled = x_valid_scaled.reshape(x_valid_scaled.shape[0],x_valid_scaled.shape[1],1)

    return stder,x_total_train_scaled,x_test_scaled,x_valid_scaled