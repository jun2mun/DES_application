import tensorflow as tf
from tensorflow import keras
from tensorflow.python.keras import layers as L
from tensorflow.python.keras import optimizers
import numpy as np
from tensorflow.python.keras.models import Model
from tensorflow.python.keras.layers import LSTM, Dropout
from tensorflow.python.keras.layers import RepeatVector, Dense

class lstm_model():
    def __init__(self,serize_size,n_features):
        self.epochs = 1000
        self.batch = 128
        self.lr = 0.001
        self.serize_size = serize_size
        self.n_features = n_features
        self.model = None
        self.autoencoder_model = None

    def init_model(self):
        self.model = keras.Sequential()
        self.model.add(L.LSTM(10, input_shape=(self.serize_size, self.n_features), return_sequences=True))
        self.model.add(L.LSTM(6, activation='relu', return_sequences=True))
        self.model.add(L.LSTM(1, activation='relu'))
        self.model.add(L.Dense(10, kernel_initializer='glorot_normal', activation='relu'))
        self.model.add(L.Dense(10, kernel_initializer='glorot_normal', activation='relu'))
        self.model.add(L.Dense(1))
        
        adam = keras.optimizers.Adam(self.lr)
        self.model.compile(loss='mse', optimizer=adam)
        return self.model

    def model_train(self,X_train,Y_train,X_valid,Y_valid):
        
        return self.model.fit(X_train, Y_train, 
                              validation_data=(X_valid, Y_valid), 
                              batch_size=self.batch, 
                              epochs=self.epochs, 
                              verbose=2)
    
    def init_lstm_encoder(self):
        self.autoencoder_model = keras.Sequential()
        self.autoencoder_model.add(L.LSTM(self.serize_size, activation='relu', input_shape=(self.serize_size,self.n_features), return_sequences=True))
        self.autoencoder_model.add(L.LSTM(6, activation='relu', return_sequences=True))
        self.autoencoder_model.add(L.LSTM(1, activation='relu'))
        self.autoencoder_model.add(L.RepeatVector(self.serize_size))
        self.autoencoder_model.add(L.LSTM(self.serize_size, activation='relu', return_sequences=True))
        self.autoencoder_model.add(L.LSTM(6, activation='relu', return_sequences=True))
        self.autoencoder_model.add(tf.keras.layers.TimeDistributed(L.Dense(1)))
        
        adam = keras.optimizers.Adam(self.lr)
        self.autoencoder_model.compile(loss='mse', optimizer=adam)
        return self.autoencoder_model

    def encoder_train(self,X_train,Y_train,X_valid,Y_valid):
        return self.autoencoder_model.fit(X_train, X_train, 
                                              batch_size=self.batch, 
                                              epochs=self.epochs, 
                                              verbose=2)
    


# LSTM AE model for anomaly detection
# coded by st.watermelon




""" LSTM encoder """
class Encoder(Model):

    def __init__(self, seq_length, latent_dim):
        super(Encoder, self).__init__()

        self.h1 = tf.keras.layers.LSTM(128, return_sequences=True)  # (seq_len, input_dim) -> (seq_len, 128))
        self.h2 = tf.keras.layers.LSTM(latent_dim, return_sequences=False) # (seq_len , 128) -> (latent_dim)
        self.h3 = tf.keras.layers.RepeatVector(seq_length) # (latent_dim) -> (seq_length, latent_dim)

    def call(self, x):
        x = self.h1(x)
        z = self.h2(x)
        z_rep = self.h3(z)

        return z, z_rep

""" LSTM dncoder """
class Decoder(Model):

    def __init__(self, input_dim, latent_dim):
        super(Decoder, self).__init__()

        self.h1 = tf.keras.layers.LSTM(latent_dim, return_sequences=True) # (seq_length, latent_dim) -> (seq_len, input_dim)
        self.h2 = tf.keras.layers.LSTM(128, return_sequences=True) # (seq_len, input_dim) -> (seq_length, 128)
        self.h3 = tf.keras.layers.TimeDistributed(tf.keras.layers.Dense(input_dim)) # (seq_length, 128) -> (seq_length, input_dim)

    def call(self, x):
        x = self.h1(x)
        x = self.h2(x)
        x = self.h3(x)

        return x


""" LSTM AE """
class LstmAE(Model):

    def __init__(self, seq_length, input_dim, latent_dim):
        super(LstmAE, self).__init__()

        self.encoder = Encoder(seq_length, latent_dim)
        self.decoder = Decoder(input_dim, latent_dim)

    def call(self, x):
        z, z_rep = self.encoder(x)
        decoded = self.decoder(z_rep)

        return decoded