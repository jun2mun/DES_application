import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold

def outlier_based_data(data):
    x = []
    y = []
    temp = []; y_push = False
    for i in data:
        if y_push == True:
            y.append(i)
        y_push = False    
        temp.append(i)
        if len(temp) == 10:
            x.append(temp)
            temp = []
            y_push = True

    x = np.array(x)
    y = np.array(y)
    return x,y
    

def get_data(data):
    x = []
    y = []
    temp = []; y_push = False
    for i in data.itertuples():
        if y_push == True:
            y.append(i[2])
        y_push = False    
        temp.append(i[2])
        if len(temp) == 10:
            x.append(temp)
            temp = []
            y_push = True

    x = np.array(x)
    y = np.array(y)
    return x,y
    
def get_rare_data(data):

    x = []
    temp = []; y_push = False
    for i in data.itertuples():
        x.append(i[2])

    x = np.array(x)
    return x

def t_t_v(x,y):
    X_train,X_test,y_train,y_test = train_test_split(x,y,test_size=0.2,random_state=1)
    return X_train,X_test,y_train,y_test


def K_val(x,y):
    skf = StratifiedKFold(n_splits=2)
    skf.get_n_splits(x,y)
    
    for train_index,test_index in skf.split(x,y):
        x_train,x_test = x[train_index], x[test_index]
        y_train,y_test = y[train_index], y[test_index]



    return x_train,x_test,y_train,y_test