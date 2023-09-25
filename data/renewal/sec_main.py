import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn import metrics
from utils.utils import *
from model import LstmAE
from tensorflow import keras
from train import *

import tensorflow as tf
seq_len =10; 

#total_raw_data,total_data_train,total_data_test,total_test_tot, x_test,x_valid,y_test,y_valid = raw_train_test_split()
import os

os.environ["CUDA_VISIBLE_DEVICES"]="0"
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        tf.config.experimental.set_memory_growth(gpus[0], True)
    except RuntimeError as e:
        print(e)


normal_raw_data = pd.read_csv("./data/renewal/second_EAR.csv")
normal_data_list = normal_raw_data['EAR'].values.tolist()


## 전처리
normal_data = []; abnormal_data = [] ; seq_len = 60
for i in range(len(normal_data_list) - seq_len):
    temp = normal_data_list[i:(i+seq_len)]
    #print(f'total_60 : {total_60}')
    anomal = False
    for x in temp:
        if x > 0.3:
            anomal = True
    if (anomal):
        normal_data.append(tuple(normal_data_list[i:(i+seq_len)]))
    else:
        abnormal_data.append(tuple(normal_data_list[i:(i+seq_len)]))

normal_data = list(set(normal_data))
abnormal_data= list(set(abnormal_data))


normal_data_count = len(normal_data) # 9564
abnormal_data_count = len(abnormal_data)  # 3566

normal_data = np.array(normal_data).reshape(-1,seq_len)
normal_data = normal_data.astype('float32')

normal_data_train = normal_data[:int(normal_data_count*0.8)]
normal_data_test = normal_data[int(normal_data_count*0.8):int(normal_data_count*0.8)+abnormal_data_count]


abnormal_data = np.array(abnormal_data).reshape(-1,seq_len)
abnormal_data_test = abnormal_data[:int(abnormal_data_count*0.3)]
print([sum(i)for i in abnormal_data_test.tolist()])
print([sum(i)for i in normal_data_test.tolist()])

## 테스트 검증 데이터 만들기
## 테스트 검증 데이터 만들기
normal_test_tot = np.hstack((normal_data_test,np.zeros(normal_data_test.shape[0]).reshape(-1,1))) # 
abnormal_test_tot = np.hstack((abnormal_data_test,np.ones(abnormal_data_test.shape[0]).reshape(-1,1))) # 
test_tot = np.vstack((normal_test_tot,abnormal_test_tot))

#x_test,x_valid,y_test,y_valid = train_test_split(total_test_tot[:,:-1],total_test_tot[:,-1],test_size=0.3)
x_test,x_valid,y_test,y_valid = train_test_split(test_tot[:,:-1],test_tot[:,-1],test_size=0.3)



LABELS = ['Normal', 'Break']
import seaborn as sns


stder,x_total_train_scaled,x_test_scaled,x_valid_scaled = standardlize(normal_data_train,normal_data_test,test_tot, x_test,x_valid,y_test,y_valid)

input_dim = x_total_train_scaled.shape[2]; latent_dim = 16

lstm_ae,seq_len,input_dim,latent_dim = train(x_total_train_scaled,seq_len,latent_dim)

lstm_ae = load_model(seq_len,input_dim,latent_dim)

threshold_fixed,mse,error_df  = calc_threshold(lstm_ae,x_valid_scaled,y_valid)
#threshold_fixed = 3
eval(lstm_ae,x_test_scaled,y_test,threshold_fixed)




# classification by threshold
pred_y = [1 if e > threshold_fixed else 0 for e in error_df['Reconstruction_error'].values]

conf_matrix = metrics.confusion_matrix(error_df['True_class'], pred_y)
plt.figure(figsize=(7, 7))
sns.heatmap(conf_matrix, xticklabels=LABELS, yticklabels=LABELS, annot=True, fmt='d')
plt.title('Confusion Matrix')
plt.xlabel('Predicted Class'); plt.ylabel('True Class')
plt.show()


false_pos_rate, true_pos_rate, thresholds = metrics.roc_curve(error_df['True_class'], error_df['Reconstruction_error'])
roc_auc = metrics.auc(false_pos_rate, true_pos_rate,)

plt.plot(false_pos_rate, true_pos_rate, linewidth=5, label='AUC = %0.3f'% roc_auc)
plt.plot([0,1],[0,1], linewidth=5)

plt.xlim([-0.01, 1])
plt.ylim([0, 1.01])
plt.legend(loc='lower right')
plt.title('Receiver operating characteristic curve (ROC)')
plt.ylabel('True Positive Rate'); plt.xlabel('False Positive Rate')
plt.show()