import csv, json

filename = 'SA2_name_and_code.csv'

i = 0

sa2_dict = {}
sa2_list = []
sa2_list_dict = {}

with open(filename) as f:
    is_header = True
    reader = csv.reader(f)
    for line in reader:
        if is_header:
            header_row = line
            is_header = False
        else:
            sa2_dict[line[1]] = line[0]
            sa2_list.append(line[1])

with open('sa2_dict.js', 'w') as file:
    file.write('var sa2_dict = ')
    file.write(json.dumps(sa2_dict))

with open('sa2_list_dict.js', 'w') as file:
    sa2_list.sort()
    for i in range(len(sa2_list)):
        sa2_list_dict[str(i)] = sa2_list[i]
    file.write(json.dumps(sa2_list_dict))
