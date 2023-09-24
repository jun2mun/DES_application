from statsmodels.tsa.stattools import kpss
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

normal_raw_data = pd.read_csv("./data/renewal/second.csv")
print(sum(normal_raw_data['count'])/len(normal_raw_data)*60)
normal_data_list = normal_raw_data['count'].values.tolist()

## 전처리
normal_data = []; abnormal_data = [] ; seq_len = 60
for i in range(len(normal_data_list) - seq_len):
    total_60 = sum(normal_data_list[i:(i+seq_len)])
    #print(f'total_60 : {total_60}')
    if (10 <= total_60 <= 29)  :
        normal_data.append(normal_data_list[i:(i+seq_len)])
    else:
        abnormal_data.append(normal_data_list[i:(i+seq_len)])

from statsmodels.stats.weightstats import ztest

test = [sum(i) for i in normal_data]
_, p = ztest(test)
print(p)  # 0 정규분포는 아님


from statsmodels.tsa.seasonal import seasonal_decompose

# 계절적 성분 50일로 가정
# extrapolate_trend='freq' : Trend 성분을 만들기 위한 rolling window 때문에 필연적으로 trend, resid에는 Nan 값이 발생하기 때문에, 이 NaN값을 채워주는 옵션이다.
result = seasonal_decompose(test, model='additive', two_sided=True, 
                            period=50, extrapolate_trend='freq') 
result.plot()
#plt.show()

# Residual의 분포 확인
#fig, ax = plt.subplots(figsize=(9,6))
#_ = plt.hist(result.resid, 100, density=True, alpha=0.75)
#plt.show()


r = result.resid
st, p = ztest(r)
print(st,p)


# 평균과 표준편차 출력
mu, std = result.resid.mean(), result.resid.std()
print("평균:", mu, "표준편차:", std)
# 평균: -0.3595321143716522 표준편차: 39.8661527194307

# 3-sigma(표준편차)를 기준으로 이상치 판단
print("이상치 갯수:", len(result.resid[(result.resid>mu+3*std)|(result.resid<mu-3*std)]))
# 이상치 갯수: 71


from sklearn.cluster import KMeans
r= r.reshape(-1,1)
kmeans = KMeans(n_clusters=2, random_state=0).fit(r)
print(kmeans.labels_) # 분류된 라벨은 이렇게 kemans.labels_ 로 확인
# [1 1 1 ... 0 0 0]


# 표준정규화
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
scaler.fit(r)
print(scaler.mean_)
# [-0.40184982  -0.38035856  -0.39874878  -0.37402025 -195.40645742]

norm_rdf = scaler.transform(r)
norm_rdf


# 라벨은 몇번 그룹인지 뜻한다. 
# return_counts=True : 몇개의 샘플이 몇번 그룹에 할당되었는지 확인
lbl, cnt = np.unique(kmeans.labels_,return_counts=True) 
print(lbl) # [0 1]  -> 0번 그룹, 1번 그룹으로 나뉨
print(cnt) # [3258 2434]  -> 0번그룹에 3258, 1번그룹에 2434

from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=15, random_state=0).fit(norm_rdf)
lbl, cnt = np.unique(kmeans.labels_,return_counts=True,)
['group:{}-count:{}'.format(group, count) for group, count in zip(lbl, cnt)]

from sklearn.cluster import DBSCAN

clustering = DBSCAN(eps=0.7, min_samples=2).fit(norm_rdf)
print(clustering)  # BSCAN(eps=0.7, min_samples=2)
print(clustering.labels_)  # [0 0 0 ... 0 0 0]

lbl, cnt = np.unique(clustering.labels_,return_counts=True)
['group:{}-count:{}'.format(group, count) for group, count in zip(lbl, cnt)]

