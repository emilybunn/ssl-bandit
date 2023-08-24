import json
import csv
import copy

sample_sizes = [10, 30, 100]

"""
This file will read in generated data and save it as a json file.
"""

filename1 = "data/([0.55, 0.25, 0.8], [[2, 4], [3, 5], [1, 3]]) Results.json"
filename2 = "data/([0.6, 0.35, 0.85], [[2, 4], [3, 5], [3, 5]]) Results.json"
filename3 = "data/([0.35, 0.75, 0.3], [[3, 4], [3, 4], [4, 6]]) Results.json"

files = [filename1, filename2, filename3]

for filename in files:
    with open(filename, "r") as f:
        data = json.load(f)

    data_n_10 = copy.deepcopy([data[i] for i in range(0, 100, 10)])
    data_n_30 = copy.deepcopy([data[i] for i in range(0, 90, 3)])
    data_n_100 = copy.deepcopy(data)

    datasets = [data_n_10, data_n_30, data_n_100]

    for dataset in datasets:
        # Rank the datasets.
        rank = 1
        prior_reward = 0
        for i in range(len(dataset)):
            run = dataset[i]
            if run['score'] < prior_reward:
                rank += 1
            prior_reward = run['score']
            run['rank'] = rank

    total_data = [
        {"n": len(data_n_10), "data": data_n_10},
        {"n": len(data_n_30), "data": data_n_30},
        {"n": len(data_n_100), "data": data_n_100}
    ]

    with open(filename, "w") as outfile:
        ranked_data = json.dumps(total_data, indent=4)
        outfile.write(ranked_data)