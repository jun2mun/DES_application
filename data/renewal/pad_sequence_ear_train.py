#from keras.preprocessing.sequence import pad_sequences
import rrcf
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from keras.utils import pad_sequences
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn import metrics
from utils.utils import *
from model import LstmAE
from tensorflow import keras
from train import *

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("./data/renewal/SEQUENCE.csv")
EAR_HISTORY = df['EAR_HISTORY'].values.tolist()
EAR_STATUS = df['STATE'].values.tolist()

def get_outlier(df=None, column=None, weight=1.5):
  # target 값과 상관관계가 높은 열을 우선적으로 진행
  quantile_25 = np.percentile(df[column].values, 25)
  quantile_75 = np.percentile(df[column].values, 75)

  IQR = quantile_75 - quantile_25
  IQR_weight = IQR*weight
  
  lowest = quantile_25 - IQR_weight
  highest = quantile_75 + IQR_weight
  
  outlier_idx = df[column][ (df[column] < lowest) | (df[column] > highest) ].index
  return outlier_idx


NORMAl_TOTAL_DATA = []; ABNORMAL_TOTAL_DATA = []
TOTAL_DATA = []; len_TOTAL_DATA = []
for HISTORIES,STATE in zip(EAR_HISTORY,EAR_STATUS):
    HISTORY = list(map(float,HISTORIES.split('#')))
    TOTAL_DATA.append(HISTORY)
    len_TOTAL_DATA.append(len(HISTORY))
    if STATE == 'normal': # 정상데이터
        NORMAl_TOTAL_DATA.append(HISTORY)
    else:
        ABNORMAL_TOTAL_DATA.append(HISTORY)
    #print(HISTORY)
#TOTAL_DATA = np.array(TOTAL_DATA,dtype='object')

lens_df = pd.DataFrame(len_TOTAL_DATA,columns = ['lens'])
outlier_idx = get_outlier(df=lens_df, column='lens', weight=1.5)

abnormal_data = []
for i in outlier_idx: 
  abnormal_data += [list(df.iloc[i])]

print(len(abnormal_data))

lens_df.drop(outlier_idx, axis=0, inplace=True)

result = lens_df['lens'].values.tolist()
result.sort(key=lambda x : -x)
#print(len(result),'길이') # 35340 길이
plt.boxplot(result)
plt.show()

print(df)
normal_data = []
for i in result:
    normal_data += [list(df.iloc[i])]
print(normal_data)


normal_data = pd.DataFrame(normal_data,columns = ['EAR_ID','EAR_HISTORY','STATE'])
EAR_HISTORY = normal_data['EAR_HISTORY'].values.tolist()
EAR_STATUS = normal_data['STATE'].values.tolist()
NORMAl_TOTAL_DATA = []; ABNORMAL_TOTAL_DATA = []
TOTAL_DATA = []
for HISTORIES,STATE in zip(EAR_HISTORY,EAR_STATUS):
    HISTORY = list(map(float,HISTORIES.split('#')))
    TOTAL_DATA.append(HISTORY)
    if STATE == 'normal': # 정상데이터
        NORMAl_TOTAL_DATA.append(HISTORY)
    else:
        ABNORMAL_TOTAL_DATA.append(HISTORY)
    #print(HISTORY)
TOTAL_DATA = np.array(TOTAL_DATA,dtype='object')
NORMAl_TOTAL_DATA = np.array(NORMAl_TOTAL_DATA,dtype='object')
ABNORMAL_TOTAL_DATA = np.array(ABNORMAL_TOTAL_DATA,dtype='object')


seq_len = 60
PREPROCESS_NORMAl_TOTAL_DATA = pad_sequences(sequences=NORMAl_TOTAL_DATA,maxlen=seq_len, dtype='float32')
PREPROCESS_ABNORMAL_TOTAL_DATA= pad_sequences(sequences=ABNORMAL_TOTAL_DATA,maxlen=seq_len, dtype='float32')

normal_data = PREPROCESS_NORMAl_TOTAL_DATA
abnormal_data = PREPROCESS_ABNORMAL_TOTAL_DATA


normal_data = np.array(normal_data).reshape(-1,seq_len)
normal_data = normal_data.astype('float32')

normal_data_count = len(normal_data) # 9564
abnormal_data_count = len(abnormal_data)  # 3566

np.random.shuffle(normal_data)
normal_data_train = normal_data[:int(normal_data_count*0.8)]
normal_data_test = normal_data[int(normal_data_count*0.8):int(normal_data_count*0.8)+abnormal_data_count]


abnormal_data = np.array(abnormal_data).reshape(-1,seq_len)
np.random.shuffle(abnormal_data)
abnormal_data_test = abnormal_data[:int(abnormal_data_count*0.3)]
#print([sum(i)for i in abnormal_data_test.tolist()])
#print([sum(i)for i in normal_data_test.tolist()])

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

input_dim = x_total_train_scaled.shape[2]; latent_dim = 64

#lstm_ae,seq_len,input_dim,latent_dim = train(x_total_train_scaled,seq_len,latent_dim)

lstm_ae = load_model(seq_len,input_dim,latent_dim)

threshold_fixed,mse,error_df = calc_threshold(lstm_ae,x_valid_scaled,y_valid)

#threshold_fixed = 3
#eval(lstm_ae,x_test_scaled,y_test,threshold_fixed)

# 0.9746426117388178
#threshold_fixed = 0.9746426117388178
# classification by threshold
pred_y = [1 if e > threshold_fixed else 0 for e in error_df['Reconstruction_error'].values]
print(error_df['Reconstruction_error'].values)

conf_matrix = metrics.confusion_matrix(error_df['True_class'], pred_y)
plt.figure(figsize=(7, 7))
sns.heatmap(conf_matrix, xticklabels=LABELS, yticklabels=LABELS, annot=True, fmt='d')
plt.title('Confusion Matrix')
plt.xlabel('Predicted Class'); plt.ylabel('True Class')
plt.show()

#Robust Random Cut Forest (RRCF)

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

print('hi')