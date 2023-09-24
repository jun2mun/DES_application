import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from keras.callbacks import EarlyStopping
from sklearn import metrics
from utils.utils import *
from model import LstmAE
from tensorflow import keras
# 모델 학습#
def train(x_total_train_scaled,seq_len,latent_dim):
    # specify learning rate
    learning_rate = 0.001
    # create an Adam optimizer with the specified learning rate
    adam = keras.optimizers.Adam(learning_rate=learning_rate)

    # input(3,5) #timestamp , feature
    input_dim = x_total_train_scaled.shape[2]
    latent_dim = 64

    print('hi')
    # create lstm_ae agent
    lstm_ae = LstmAE(seq_len, input_dim, latent_dim)
    lstm_ae.compile(loss='mse',optimizer='adam')

    # train
    callbacks = [EarlyStopping(monitor='val_loss',patience=10)]
    history = lstm_ae.fit(x_total_train_scaled, x_total_train_scaled, epochs=300, batch_size=32, 
                          validation_split=0.1,callbacks=callbacks,verbose=2)

    # save weights
    lstm_ae.save_weights("./data/save_weights/lstm_ae.h5")

    # plotting
    plt.plot(history.history['loss'], label='Training loss')
    plt.plot(history.history['val_loss'], label='Validation loss')
    plt.legend()
    plt.show()
    print('hi')

    return lstm_ae,seq_len,input_dim,latent_dim

def load_model(seq_len,input_dim,latent_dim):
    lstm_ae = LstmAE(seq_len, input_dim, latent_dim)
    lstm_ae.build(input_shape=(None, seq_len, input_dim ))
    lstm_ae.load_weights("./data/save_weights/lstm_ae.h5")
    return lstm_ae



# threshold 구하기#
def calc_threshold(lstm_ae,x_valid_scaled,y_valid):

    predictions_3d = lstm_ae.predict(x_valid_scaled)
    predictions = predictions_3d.reshape(predictions_3d.shape[0],predictions_3d.shape[1])
    x_valid_ = x_valid_scaled.reshape(x_valid_scaled.shape[0],x_valid_scaled.shape[1])

    mse = np.mean(np.power(x_valid_ - predictions,2),axis = 1)

    error_df = pd.DataFrame({'Reconstruction_error':mse,
                            'True_class':y_valid})
    print(error_df.describe())

    precision_rt,recall_rt,threshold_rt = metrics.precision_recall_curve(
        error_df['True_class'],error_df['Reconstruction_error']
    )

    best_cnt_dic = abs(precision_rt-recall_rt)
    threshold_fixed = threshold_rt[np.argmin(best_cnt_dic)]
    print('prcision ',precision_rt[np.argmin(best_cnt_dic)],'recall : ',recall_rt[np.argmin(best_cnt_dic)])
    print('threshold :',threshold_fixed)
    plt.figure(figsize=(8,5))
    plt.plot(threshold_rt,precision_rt[1:],label='Precision')
    plt.plot(threshold_rt,recall_rt[1:],label='Recall')
    plt.xlabel('Threshold'); plt.ylabel('Precison/Recall')
    plt.legend()
    plt.show()
    return threshold_fixed,mse,error_df

def eval(lstm_ae,x_test_scaled,y_test,threshold_fixed):
    test_x_predictions_3d = lstm_ae.predict(x_test_scaled)

    test_x_predictions = test_x_predictions_3d.reshape(test_x_predictions_3d.shape[0],test_x_predictions_3d.shape[1])
    x_test_scaled = x_test_scaled.reshape(x_test_scaled.shape[0],x_test_scaled.shape[1])


    mse = np.mean(np.power(x_test_scaled - test_x_predictions, 2), axis=1)

    error_df = pd.DataFrame({'Reconstruction_error': mse,
                            'True_class': y_test})

    groups = error_df.groupby('True_class')
    fig, ax = plt.subplots()

    for name, group in groups:
        ax.plot(group.index, group.Reconstruction_error, marker='o', ms=3.5, linestyle='',
                label= "Break" if name == 1 else "Normal")
    ax.hlines(threshold_fixed, ax.get_xlim()[0], ax.get_xlim()[1], colors="r", zorder=100, label='Threshold')
    ax.legend()
    plt.title("Reconstruction error for different classes")
    plt.ylabel("Reconstruction error")
    plt.xlabel("Data point index")
    plt.show()
    print('hi')