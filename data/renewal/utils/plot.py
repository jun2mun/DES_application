import pandas as pd
import matplotlib.pyplot as plt

normal_raw_data = pd.read_csv("./data/renewal/second_EAR.csv")
normal_data_list = normal_raw_data['EAR'].values.tolist()

time_len = 5000
maxs = len(normal_data_list) // time_len

for i in range(1,maxs+1):
    tmp = normal_data_list[time_len*(i-1):time_len*i]


    plt.plot([i for i in range(len(tmp))],tmp)
    plt.show()