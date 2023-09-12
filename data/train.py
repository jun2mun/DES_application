import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.python.keras import layers
from data import get_data,t_t_v,K_val,outlier_based_data,get_rare_data
import matplotlib.pyplot as plt
import pandas as pd
from outlier import get_outlier
from keras.callbacks import ModelCheckpoint, EarlyStopping
# 30분
layer_input = keras.Input(shape=(10,1), name='input')
layer_rnn = keras.layers.SimpleRNN(100,name='RNN')(layer_input)
layer_output = keras.layers.Dense(1,name='output')(layer_rnn)

model = keras.Model(layer_input,layer_output)
print(model.summary())

model.compile(loss='mse',optimizer='adam')
earlystopping = EarlyStopping(monitor='val_loss',  # 모니터 기준 설정 (val loss) 
                              patience=10,         # 10회 Epoch동안 개선되지 않는다면 종료
                             )
'''
df = pd.read_csv("./main.csv")
# 함수 사용해서 이상치 값 삭제
outlier_idx = get_outlier(df=df, column='count', weight=1.5)
df.drop(outlier_idx, axis=0, inplace=True)
x,y = get_data(df)
X_train,X_test,y_train,y_test = t_t_v(x,y)

outlier_idx = get_outlier(df=df, column='count', weight=1.5)
df.drop(outlier_idx, axis=0, inplace=True)
###
x = get_rare_data(df)

plt.figure()
#plt.plot(np.sort(x),pdf)
plt.plot(x)
plt.show()
'''
df = pd.read_csv("./main.csv")
x,y = get_data(df)
X_train,X_test,y_train,y_test = t_t_v(x,y)
history = model.fit(X_train,y_train,epochs=100,batch_size=1,verbose=0,validation_data=(X_test, y_test),callbacks=[earlystopping])

y_vloss = history.history['val_loss']
y_loss = history.history['loss']

x_len = np.arange(len(y_loss))
plt.plot(x_len, y_vloss, marker='.', c='red', label="Validation-set Loss")
plt.plot(x_len, y_loss, marker='.', c='blue', label="Train-set Loss")

plt.legend(loc='upper right')
plt.grid()
plt.xlabel('epoch')
plt.ylabel('loss')
plt.show()


x_input = np.array([10,11,8,10,9,6,2,11,4,5])
x_input = x_input.reshape((1,10,1))
 
yhat = model.predict(x_input)

print(yhat)
