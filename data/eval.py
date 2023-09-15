# LSTM AE model evaluation for anomaly detection
# coded by st.watermelon

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from data import get_data,t_t_v,get_rare_data
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

from model import LstmAE

def eval(lstm_ae, scaler, train, trainX):

    if os.path.exists('./data/save_weights/lstm_ae.h5'):
        lstm_ae.load_weights("./data/save_weights/lstm_ae.h5")
    else:
        return 0

    # predict on the training data
    trainPredict = lstm_ae.predict(trainX)
    #print(trainX.shape, trainPredict.shape)  # (978,30,1)

    # compute mean absolute error
    trainMAE = np.mean(np.abs(trainPredict - trainX), axis=1)
    #print(trainMAE.shape) # (978,1)

    # plot MAE distribution
    plt.hist(trainMAE, bins=30)
    plt.show()

    # assuming the 'Close' price is the first feature
    close_feature_index = 0

    # select the 'Close' price predictions for the last time step in each sequence
    predicted_prices = trainPredict[:, -1, close_feature_index].reshape(-1, 1)
    print(predicted_prices.shape, trainPredict.shape)  # (978,1) (978,30,1)

    # inverse transform the predicted prices
    ##predicted_prices = scaler.inverse_transform(predicted_prices)

    #scaler.inverse_transform(train['Close'].values.reshape(-1, 1))
    
    # Plot actual vs predicted prices
    plt.figure(figsize=(12, 6))
    plt.plot(train.index, predicted_prices, color='blue',
             label='Actual close price')
    plt.plot(train.index[len(train.index) - len(predicted_prices):], predicted_prices, color='red',
             label='Predicted close price')
    plt.legend()
    plt.show()


def detect(lstm_ae, seq_len, scaler, max_trainMAE, test, testX):

    if os.path.exists('./data/save_weights/lstm_ae.h5'):
        lstm_ae.load_weights("./data/save_weights/lstm_ae.h5")
    else:
        return 0

    testPredict = lstm_ae.predict(testX)
    testMAE = np.mean(np.abs(testPredict - testX), axis=1)

    plt.hist(testMAE, bins=30)
    plt.show()

    # Assuming the 'Close' price is the first feature
    close_feature_index = 0

    # Select the 'Close' price predictions for the last time step in each sequence
    predicted_prices = testPredict[:, -1, close_feature_index].reshape(-1, 1)

    # Inverse transform the predicted prices
    #predicted_prices = scaler.inverse_transform(predicted_prices)
    #scaler.inverse_transform(test['Close'].values.reshape(-1, 1))
    # Plot actual vs predicted prices
    plt.figure(figsize=(12, 6))
    plt.plot(predicted_prices, color='blue', #test.index, 
             label='Actual close price')
    plt.plot( predicted_prices, color='green',
             label='Predicted close price') # test.index[len(test.index) - len(predicted_prices):],
    plt.legend()

    # Capture all details in a DataFrame for easy plotting
    anomaly_df = pd.DataFrame(test[seq_len:])
    anomaly_df['testMAE'] = testMAE
    anomaly_df['max_trainMAE'] = max_trainMAE
    anomaly_df['anomaly'] = anomaly_df['testMAE'] > anomaly_df['max_trainMAE']
    anomaly_df['Close'] = test[seq_len:]['Close']

    anomalies = anomaly_df.loc[anomaly_df['anomaly'] == True]


    # plot anomalies
    if not anomalies.empty:
        sns.scatterplot(x=anomalies.index,
                        y=scaler.inverse_transform(anomalies['Close'].values.reshape(-1, 1)).flatten(),
                        color='r')

    #plt.xticks(rotation=90)
    plt.show()


if __name__ == "__main__":

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

    ev = 1
    if ev == 1:
        eval(lstm_ae, scaler, train, trainX)
    else:
        max_trainMAE = 0.08
        detect(lstm_ae, seq_len, scaler, max_trainMAE, test, testX)