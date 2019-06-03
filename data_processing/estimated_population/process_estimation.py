import csv, json, math


estimation_year = [2021, 2026, 2031, 2036, 2041]

contribution_rate = [0.6, 0.64]

au_population_2016 = [7480230, 5926624, 4703192, 1676653, 2474414, 509961, 228838, 397393]

au_immigrant_2016 = [2581028, 2081109, 1359372, 484103, 981555, 98466, 71307, 127354]


all_states = []

for i in range(1, 9):
    filename = '32220_table_b' + str(i) + '.csv'
    with open(filename) as f:
        one_state = [au_population_2016[i - 1]]
        reader = csv.reader(f)
        for line in reader:
            if line[0].startswith('Jun-'):
                year = line[0][-4:]
                if int(year) in estimation_year:
                    # print(line)
                    total = 0
                    for j in range(1, len(line)):
                        total += int(line[j])
                    # print(total)
                    one_state.append(total)
        all_states.append(one_state)


immigrant_variance_all_states = []

for one_state in all_states:
    immigrant_variance_one_state = []
    for j in range(1, len(one_state)):
        if j < 3:
            immigrant_variance_one_state.append(math.floor((one_state[j] - one_state[j - 1]) * contribution_rate[0]))
        else:
            immigrant_variance_one_state.append(math.floor((one_state[j] - one_state[j - 1]) * contribution_rate[1]))
    immigrant_variance_all_states.append(immigrant_variance_one_state)



immigrant_all_states = []


for i in range(0, len(immigrant_variance_all_states)):
    immigrant_one_state = [au_immigrant_2016[i]]
    # immigrant_one_state = []
    sum = au_immigrant_2016[i]
    for j in immigrant_variance_all_states[i]:
        sum += j
        immigrant_one_state.append(sum)
    immigrant_all_states.append(immigrant_one_state)


print(immigrant_all_states)



with open('estimation_result.js', 'w') as file:
    file.write('var estimationResult = {"data": ' + json.dumps(immigrant_all_states) + '}')
    print('var estimationResult = {"data": ' + json.dumps(immigrant_all_states) + '}')



