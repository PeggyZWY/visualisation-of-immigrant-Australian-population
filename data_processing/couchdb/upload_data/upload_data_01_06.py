import csv, couchdb, time, glob

print('---- start ----')
start_time = time.time()

server = couchdb.Server('http://wenyi:cloud@localhost:5984/')

try:
    db = server['all_data']
except Exception:
    db = server.create('all_data')



filename = 'SA2_name_and_code.csv'
sa2_dict = {}

with open(filename) as f:
    is_header = True
    reader = csv.reader(f)
    for line in reader:
        if is_header:
            header_row = line
            is_header = False
        else:
            sa2_dict[line[0]] = line[1]



filename = 'BPLP.csv'
bplp_dict = {}

with open(filename) as f:
    is_header = True
    reader = csv.reader(f)
    for line in reader:
        if is_header:
            header_row = line
            is_header = False
        else:
            value = [line[1], line[2]]
            bplp_dict[line[0]] = value

states_list = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']
years = [2006, 2001]

for year in years:
    doc_list = []
    china_dict = {}
    for i in range(33):
        dir_name = '01_06_data/' + str(year) + '-01-01_-_' + str(year) + '-01-01.csv (' + str(i) + ')'
        data_file = glob.glob(dir_name + '/*.csv')[0]
        is_header = True
        print('start: ' + data_file)
        with open(data_file) as f:
            reader = csv.reader(f)
            for line in reader:
                doc = {}
                if is_header:
                    header_row = line
                    is_header = False
                else:
                    if line[1] == '6102':
                        china_sa2 = china_dict.get(line[4])
                        if china_sa2 == None:
                            doc['year'] = year
                            doc['ori_country'] = bplp_dict[line[1]][0]
                            doc['ori_continent'] = bplp_dict[line[1]][1]
                            try:
                                doc['au_sa2_name'] = sa2_dict[line[4]]
                            except:
                                continue
                            doc['au_sa2_code'] = line[4]
                            sa2_first_code = int(line[4][0])
                            if sa2_first_code > 8:
                                continue
                            else:
                                doc['au_state'] = states_list[sa2_first_code-1]
                            doc['population'] = int(line[6])
                            china_dict[line[4]] = doc
                        else:
                                china_sa2['population'] += int(line[6])
                    else:
                        # print(line[0], line[1], line[4], line[6])
                        doc['year'] = year
                        doc['ori_country'] = bplp_dict[line[1]][0]
                        doc['ori_continent'] = bplp_dict[line[1]][1]
                        try:
                            doc['au_sa2_name'] = sa2_dict[line[4]]
                        except:
                            continue
                        doc['au_sa2_code'] = line[4]
                        sa2_first_code = int(line[4][0])
                        if sa2_first_code > 8:
                            continue
                        else:
                            doc['au_state'] = states_list[sa2_first_code-1]
                        doc['population'] = int(line[6])
                        if line[1] == '6101':
                            china_dict[line[4]] = doc
                        else:
                            doc_list.append(doc)
            print('finished: ' + data_file)
    for value in china_dict.values():
        doc_list.append(value)
    db.update(doc_list)


end_time = time.time()

total_time_spent = end_time - start_time

print(start_time)
print(end_time)
print(str(total_time_spent) + ' seconds')



