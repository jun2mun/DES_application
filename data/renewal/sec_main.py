import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn import metrics
from utils.utils import *
from model import LstmAE
from tensorflow import keras
from train import *

seq_len =10; 

#total_raw_data,total_data_train,total_data_test,total_test_tot, x_test,x_valid,y_test,y_valid = raw_train_test_split()


normal_raw_data = pd.read_csv("./data/renewal/second.csv")
print(sum(normal_raw_data['count'])/len(normal_raw_data)*60)
normal_data_list = normal_raw_data['count'].values.tolist()

## 전처리
normal_data = []; abnormal_data = [] ; seq_len = 60
for i in range(len(normal_data_list) - seq_len):
    total_60 = sum(normal_data_list[i:(i+seq_len)])
    if (5 <= total_60 <= 35)  :
        normal_data.append(normal_data_list[i:(i+seq_len)])
    else:
        abnormal_data.append(normal_data_list[i:(i+seq_len)])



normal_data_count = len(normal_data)
abnormal_data_count = len(abnormal_data)

normal_data = np.array(normal_data).reshape(-1,seq_len)
normal_data = normal_data.astype('float32')

normal_data_train = normal_data[:int(normal_data_count*0.8)]
normal_data_test = normal_data[int(normal_data_count*0.8):int(normal_data_count*0.8)+abnormal_data_count]


abnormal_data = np.array(abnormal_data).reshape(-1,seq_len)
abnormal_data_test = abnormal_data[:]



## 테스트 검증 데이터 만들기
## 테스트 검증 데이터 만들기
normal_test_tot = np.hstack((normal_data_test,np.zeros(normal_data_test.shape[0]).reshape(-1,1))) # 
abnormal_test_tot = np.hstack((abnormal_data_test,np.ones(abnormal_data_test.shape[0]).reshape(-1,1))) # 
test_tot = np.vstack((normal_test_tot,abnormal_test_tot))

#x_test,x_valid,y_test,y_valid = train_test_split(total_test_tot[:,:-1],total_test_tot[:,-1],test_size=0.3)
x_test,x_valid,y_test,y_valid = train_test_split(test_tot[:,:-1],test_tot[:,-1],test_size=0.3)






stder,x_total_train_scaled,x_test_scaled,x_valid_scaled = standardlize(normal_data_train,normal_data_test,test_tot, x_test,x_valid,y_test,y_valid)

input_dim = x_total_train_scaled.shape[2]; latent_dim = 64

#lstm_ae,seq_len,input_dim,latent_dim = train(x_total_train_scaled,seq_len,latent_dim)

lstm_ae = load_model(seq_len,input_dim,latent_dim)

threshold_fixed  = calc_threshold(lstm_ae,x_valid_scaled,y_valid)
#threshold_fixed = 3
eval(lstm_ae,x_test_scaled,y_test,threshold_fixed)