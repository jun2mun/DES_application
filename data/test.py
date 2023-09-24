import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from data import get_data,t_t_v,get_rare_data
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

from model import LstmAE
from sklearn.metrics import roc_curve,auc
df = pd.read_csv("./main.csv")
    
x = get_rare_data(df)
x.astype(np.float32)
x.reshape(-1,1)
train = x[: 80]
test = x[80:]    

scaler = StandardScaler()
#scaler = scaler.fit(x)

#train = scaler.transform(train)
#test = scaler.transform(test)

seq_len = 10

X = []
for i in range(len(train) - seq_len):
    X.append(train[i:(i+seq_len)])
trainX = np.array(X)
X = []
for i in range(len(test) - seq_len):
    X.append(test[i:(i+seq_len)])
testX = np.array(X)     
trainX = trainX.reshape(-1,seq_len,1)
trainX = trainX.astype('float32')
testX = testX.reshape(-1,seq_len,1)
testX = testX.astype('float32')

input_dim = trainX.shape[2]
latent_dim = 64

lstm_ae = LstmAE(seq_len, input_dim, latent_dim)
lstm_ae.build(input_shape=(None, seq_len, input_dim))
lstm_ae.load_weights("./data/save_weights/lstm_ae.h5")


trainPredict = lstm_ae.predict(trainX)
predicted_prices = trainPredict[:, -1, 0].reshape(-1, 1)
mse = np.mean(np.abs(trainPredict - trainX), axis=1)
plt.figure(figsize=(12, 6))
plt.plot(predicted_prices, predicted_prices, color='blue',
            label='Actual close price')
plt.plot(predicted_prices, predicted_prices, color='red',
            label='Predicted close price')
plt.legend()
plt.show()

'''
for name,group in groups:
    ax.plot(group.index,group.Reconstruction_error, marker='o',ms = 3.5, linestyle='',label="Break" if name == 1 else "Normal")

threshold_fixed = 0.5
ax.hlines(threshold_fixed,ax.get_xlim()[0],ax.get_xlim()[1])

plt.show()
'''