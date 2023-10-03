import rrcf
import numpy as np
import pandas as pd
from IQR_normal import start
import matplotlib.pyplot as plt

#df,result,count_list = start()


df = pd.read_csv("./data/renewal/rrcf.csv")
EAR = df['EAR'].values.tolist()
status = df['STATE'].values.tolist()
#df = pd.read_csv("./data/renewal/second.csv")
#sin = df['count'].values.tolist()
#sin = count_list

sin = EAR[:2000]
sin_status = status[:2000]
# Set tree parameters
num_trees = 100
shingle_size = 1
tree_size = 256

# Create a forest of empty trees
forest = []
for _ in range(num_trees):
    tree = rrcf.RCTree()
    forest.append(tree)

# Use the "shingle" generator to create rolling window
points = rrcf.shingle(sin, size=shingle_size)

# Create a dict to store anomaly score of each point
avg_codisp = {}

# For each shingle...
for index, point in enumerate(points):
    print(index)
    # For each tree in the forest...
    for tree in forest:
        # If tree is above permitted size...
        if len(tree.leaves) > tree_size:
            # Drop the oldest point (FIFO)
            tree.forget_point(index - tree_size)
        # Insert the new point into the tree
        tree.insert_point(point, index=index)
        # Compute codisp on the new point...
        new_codisp = tree.codisp(index)
        # And take the average over all trees
        if not index in avg_codisp:
            avg_codisp[index] = 0
        avg_codisp[index] += new_codisp / num_trees
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

fig, ax1 = plt.subplots(figsize=(10, 5))


abnormal = []; ranges =[]
for idx in range(len(sin_status)):
    if sin_status[idx] == 'abnormal' and len(ranges) == 0:
        ranges.append(idx)
    elif sin_status[idx-1] == 'abnormal' and sin_status[idx] == 'normal':
        ranges.append(idx-1)
        abnormal.append(ranges)
        ranges = []
    
    if len(ranges) == 1 and idx == (len(sin_status)-1): # 미완인경우
        ranges.append(idx)
        abnormal.append(ranges)
        ranges = []


color = 'tab:red'
ax1.set_ylabel('Data', color=color, size=14)
ax1.plot([i for i in range(len(sin_status))],sin, color=color)
ax1.tick_params(axis='y', labelcolor=color, labelsize=12)
ax1.set_ylim(0,1)
ax2 = ax1.twinx()
for a in abnormal:
    start_a,end_a = a
    ax1.fill_between(x=range(start_a,end_a),y1=sin[start_a:end_a],alpha=0.5,color='blue')
color = 'tab:blue'
ax2.set_ylabel('CoDisp', color=color, size=14)
ax2.plot(pd.Series(avg_codisp).sort_index(), color=color)
ax2.tick_params(axis='y', labelcolor=color, labelsize=12)
ax2.grid('off')
ax2.set_ylim(0, 160)
plt.title('Sine wave with injected anomaly (red) and anomaly score (blue)', size=14)
plt.show()