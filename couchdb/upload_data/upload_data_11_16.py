import csv, couchdb, time

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
            sa2_dict[line[1]] = line[0]


years = [2016, 2011]
continents = ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania']
states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']

# continents = ['Asia', 'Europe']
# states = ['WA', 'VIC']

# try:
for year in years:
    for continent in continents:
        for state in states:
            is_header = True
            filename = str(year) + '/' + \
                str(year) + '_' + continent.replace(' ', '') + '_' + state + '.csv'
            print('start: ' + filename)
            with open(filename) as f:
                doc_list = []
                reader = csv.reader(f)
                for line in reader:
                    doc = {}
                    if is_header:
                        header_row = line
                        is_header = False
                    else:
                        for index in range(1, len(line)):
                            doc = {}
                            doc['year'] = year
                            doc['ori_country'] = line[0]
                            doc['ori_continent'] = continent
                            doc['au_sa2_name'] = header_row[index]
                            try:
                                doc['au_sa2_code'] = sa2_dict[doc['au_sa2_name']]
                            except:
                                continue
                            doc['au_state'] = state
                            doc['population'] = int(line[index])
                            doc_list.append(doc)
                db.update(doc_list)
                print('finished: ' + filename)
# except:
    # print('Error happens in: ' + str(year) + ', ' + continent + ', ' + state)


end_time = time.time()

total_time_spent = end_time - start_time

print(start_time)
print(end_time)
print(str(total_time_spent) + ' seconds')



