import pandas as pd
import json
import csv

sample_sizes = [10, 30, 100]

"""
This file will read in generated data and save it as a json file.
"""

filename1 = "data/([0.05, 0.9, 0.6], [[3, 6], [1, 3], [3, 5]]) Results.json"
filename2 = "data/([0.6, 0.35, 0.85], [[2, 4], [3, 5], [3, 5]]) Results.json"
filename3 = "data/([0.35, 0.75, 0.3], [[3, 4], [3, 4], [4, 6]]) Results.json"

files = [filename1, filename2, filename3]

for filename in files:
    with open(filename, "r") as f:
        data = json.load(f)

    data_n_10 = [data[i] for i in range(0, 100, 10)]
    data_n_30 = [data[i] for i in range(0, 100, 3)]
    data_n_100 = data

    datasets = [data_n_10, data_n_30, data_n_100]

    total_data = []

    # Rank the datasets.
    rank = 1
    prior_reward = 0
    for i in range(len(data_n_10)):
        run = data_n_10[i]
        if run['score'] < prior_reward:
            rank += 1
        prior_reward = run['score']
        run['rank'] = rank

    total_data.append({"n": len(data_n_10), "data": data_n_10})

    rank = 1
    prior_reward = 0
    for i in range(len(data_n_30)):
        run = data_n_30[i]
        if run['score'] < prior_reward:
            rank += 1
        prior_reward = run['score']
        run['rank'] = rank
    
    total_data.append({"n": len(data_n_30), "data": data_n_30})

    rank = 1
    prior_reward = 0
    for i in range(len(data_n_100)):
        run = data_n_100[i]
        if run['score'] < prior_reward:
            rank += 1
        prior_reward = run['score']
        run['rank'] = rank
    
    total_data.append({"n": len(data_n_100), "data": data_n_100})

    with open(filename, "w") as outfile:
        data = json.dumps(total_data, indent=4)
        outfile.write(data)