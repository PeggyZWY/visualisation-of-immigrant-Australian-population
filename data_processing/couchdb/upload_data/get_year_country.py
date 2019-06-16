import csv, json

filename = 'BPLP.csv'
countries_01_06 = []

with open(filename) as f:
    is_header = True
    reader = csv.reader(f)
    for line in reader:
        if is_header:
            header_row = line
            is_header = False
        else:
            countries_01_06.append(line[1])

# print(countries_01_06)


countries_11_16 = []

years = [2016, 2011]
continents = ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania']
states = ['NSW']

for year in years:
    for continent in continents:
        for state in states:
            is_header = True
            filename = str(year) + '/' + \
                str(year) + '_' + continent.replace(' ', '') + '_' + state + '.csv'
            print('start: ' + filename)
            with open(filename) as f:
                reader = csv.reader(f)
                for line in reader:
                    if is_header:
                        header_row = line
                        is_header = False
                    else:
                        countries_11_16.append(line[0])

# print(countries_11_16)

year_country_dict = {'01_06': countries_01_06, '11_16': countries_11_16}

print(year_country_dict)


with open('year_country_dict.js','w') as f:
    f.write('var year_country_dict = ')
    f.write(json.dumps(year_country_dict))
