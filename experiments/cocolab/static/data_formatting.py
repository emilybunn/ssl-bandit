import json

"""
We have the following:

Three conditions, three bandit parameters, three sample sizes.

Cond 1:
    Bandit Param 1: Sample Size 1
    Bandit Param 2: Sample Size 3
    Bandit Param 3: Sample Size 2

Cond 2:
    Bandit Param 1: Sample Size 3
    Bandit Param 2: Sample Size 2
    Bandit Param 3: Sample Size 1   

Cond 3:
    Bandit Param 1: Sample Size 2
    Bandit Param 2: Sample Size 1
    Bandit Param 3: Sample Size 3
"""

filename1 = "data/([0.05, 0.9, 0.6], [[3, 6], [1, 3], [3, 5]]) Results.json"
filename2 = "data/([0.6, 0.35, 0.85], [[2, 4], [3, 5], [3, 5]]) Results.json"
filename3 = "data/([0.35, 0.75, 0.3], [[3, 4], [3, 4], [4, 6]]) Results.json"

with open(filename1, "r") as f:
    data_1 = json.load(f)
with open(filename2, "r") as f:
    data_2 = json.load(f)
with open(filename3, "r") as f:
    data_3 = json.load(f)

teacher_data_1 = {
    "1": data_1[0],
    "2": data_2[2],
    "3": data_3[1]
}

teacher_data_2 = {
    "1": data_1[2],
    "2": data_2[1],
    "3": data_3[0]
}

teacher_data_3 = {
    "1": data_1[1],
    "2": data_2[0],
    "3": data_3[2]
}

with open('stimuli/teacher_data_0.json', 'w') as outfile:
    data = json.dumps(teacher_data_1, indent=4)
    outfile.write(data)
with open('stimuli/teacher_data_1.json', 'w') as outfile:
    data = json.dumps(teacher_data_2, indent=4)
    outfile.write(data)
with open('stimuli/teacher_data_2.json', 'w') as outfile:
    data = json.dumps(teacher_data_3, indent=4)
    outfile.write(data)

bandit_1 = {
    "1": {"p_reward": 0.05, "reward_amount": [3, 6] },
    "2": {"p_reward": 0.9, "reward_amount": [1, 3] },
    "3": {"p_reward": 0.6, "reward_amount": [3, 5] }
  }
bandit_2 = {
    "1": {"p_reward": 0.6, "reward_amount": [2, 4] },
    "2": {"p_reward": 0.35, "reward_amount": [3, 5] },
    "3": {"p_reward": 0.75, "reward_amount": [3, 5] }
  }
bandit_3 = {
    "1": {"p_reward": 0.35, "reward_amount": [3, 5] },
    "2": {"p_reward": 0.75, "reward_amount": [3, 5] },
    "3": {"p_reward": 0.3, "reward_amount": [2, 4] }
  }

bandit_params = {
    "1": bandit_1,
    "2": bandit_2,
    "3": bandit_3
}

with open('stimuli/bandit_params.json', 'w') as outfile:
    data = json.dumps(bandit_params, indent=4)
    outfile.write(data)