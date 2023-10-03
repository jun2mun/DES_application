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

def start():
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

    # 함수 사용해서 이상치 값 삭제(60초 단위에서 이상치 IQR)
    df = pd.read_csv("./data/renewal/second.csv")
    df = df['count'].values.tolist()
    result = []; seq_len = 60; sequence = []
    count_list = []
    for i in range(len(df) - seq_len):
        count_list.append(sum(df[i:(i+seq_len)]))
        result.append( [sum(df[i:(i+seq_len)]),tuple(df[i:(i+seq_len)]) ] )
        
    df = pd.DataFrame(result,columns = ['count','sequence'])
    outlier_idx = get_outlier(df=df, column='count', weight=1.5)

    df.drop(outlier_idx, axis=0, inplace=True)

    return df,result,count_list
