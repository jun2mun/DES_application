import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn import metrics
from utils.utils import *
from train import *
import matplotlib.pyplot as plt

# 함수 사용해서 이상치 값 삭제(60초 단위에서 이상치 IQR)

real_time_data = [np.random.randint(2) for _ in range(60)] 
print(sum(real_time_data))


input_dim = 1; latent_dim = 64; seq_len = 60

lstm_ae = load_model(seq_len,input_dim,latent_dim)

real_time_data = np.array(real_time_data).reshape(-1,seq_len)
stder = StandardScaler()
stder.fit(real_time_data)
real_time_data = stder.transform(real_time_data)
real_time_data = real_time_data.reshape(1,seq_len,1)

predictions = lstm_ae.predict(real_time_data)
print(predictions)

#mse = np.mean(np.power(x_valid_ - predictions,2),axis = 1)

#error_df = pd.DataFrame({'Reconstruction_error':mse,
#                        'True_class':y_valid})


#threshold_fixed = 0.9746426117388178
# classification by threshold

#pred_y = [1 if e > threshold_fixed else 0 for e in error_df['Reconstruction_error'].values]
#print(error_df['Reconstruction_error'].values)

