from data import get_data,t_t_v,K_val,outlier_based_data,get_rare_data
import matplotlib.pyplot as plt
import pandas as pd
from model import lstm_model
import numpy as np
'''
df = pd.read_csv("./data/main.csv")
x,y = get_data(df)
X_train,X_valid,Y_train,Y_valid = t_t_v(x,y)
X_train = X_train.astype(np.float32)
X_valid = X_valid.astype(np.float32)
Y_train = Y_train.astype(np.float32)
Y_valid = Y_valid.astype(np.float32)

model = lstm_model(X_train.shape[1],1)
model.init_model()
lstm_history = model.model_train(X_train,Y_train,X_valid,Y_valid)


model.init_lstm_encoder()
encoder_decoder_history = model.encoder_train(X_train,Y_train,X_valid,Y_valid)
'''


import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import seaborn as sns
from tensorflow import keras

from model import LstmAE



def train():


    df = pd.read_csv("./data/main.csv")
    
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
    trainX = trainX.reshape(-1,seq_len,1)
    trainX = trainX.astype('float32')
    input_dim = trainX.shape[2]
    latent_dim = 64

    # specify learning rate
    learning_rate = 0.001
    # create an Adam optimizer with the specified learning rate
    adam = keras.optimizers.Adam(learning_rate=learning_rate)

    # create lstm_ae agent
    lstm_ae = LstmAE(seq_len, input_dim, latent_dim)
    lstm_ae.compile(loss='mse',optimizer='adam')

    # train
    history = lstm_ae.fit(trainX, trainX, epochs=100, batch_size=32, validation_split=0.1, verbose=2)

    # save weights
    lstm_ae.save_weights("./data/save_weights/lstm_ae.h5")

    # plotting
    plt.plot(history.history['loss'], label='Training loss')
    plt.plot(history.history['val_loss'], label='Validation loss')
    plt.legend()
    plt.show()
    print('hi')


if __name__ == "__main__":

    train()