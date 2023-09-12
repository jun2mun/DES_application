import numpy as np
import pandas as pd
import random
import matplotlib.pyplot as plt
import scipy.stats as stats
from data import get_data,get_rare_data

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

'''
#x,y = get_data()

df = pd.read_csv("./main.csv")
# 함수 사용해서 이상치 값 삭제
outlier_idx = get_outlier(df=df, column='count', weight=1.5)
df.drop(outlier_idx, axis=0, inplace=True)
###
x = get_rare_data(df)


plt.figure()
#plt.plot(np.sort(x),pdf)
plt.plot(x)
plt.show()
print('end')
'''