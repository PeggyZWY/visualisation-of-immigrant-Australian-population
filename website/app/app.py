# -*- coding: utf-8 -*-

from flask import Flask, jsonify, render_template, url_for

import requests, json

app = Flask(__name__)

first_country = 'Afghanistan'
last_country = 'Yemen'

states_list = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'] # must keep this order

sa2_list = []

with open('static/map/sa2_list_dict.js') as f:
    content = f.read()
    content = json.loads(content)
    length = len(content)
    for i in range(length):
        sa2_list.append(content[str(i)])


headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en,zh-CN;q=0.9,zh;q=0.8',
    'Authorization': 'Basic dXNlcjpDNGtlRnIxZDR5NQ==',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/estimation')
def estimation():
    return render_template('estimation.html')


@app.route('/cartogram')
def cartogram():
    return render_template('cartogram.html')


@app.route('/get_VIC_topo')
def get_VIC_topo():
    return render_template('test_VIC.html')


# http://127.0.0.1/getjson/country/all/country/all
# /getjson/country/all/country/all
@app.route('/getjson/<ori_category>/<ori_name>/<au_category>/<au_name>')
def getjson(ori_category, ori_name, au_category, au_name):
    database = 'all_data'
    view_index = 'year-country-state'
    need_group = '&group=true'
    group_level = ''
    select_one = ''
    select_many = ''

    if ori_category == 'country' and ori_name == 'all' and au_category == 'country':
        view_index = 'year-country-state'
        group_level = '&group_level=2'

    if ori_category == 'country' and au_category == 'state' and au_name != 'all' and au_name not in ['2001', '2006', '2011', '2016']:
        state_name = au_name
        view_index = 'state-country-year'
        state_index = states_list.index(state_name)
        if state_index == len(states_list) - 1:
            select_many = '&startkey=["' + state_name + '"]'
        else:
            select_many = '&startkey=["' + state_name + '"]&endkey=["' + states_list[state_index+1] + '"]'

    if ori_category == 'country' and au_category == 'sa2':
        sa2_name = au_name
        view_index = 'sa2-country-year'
        sa2_index = sa2_list.index(sa2_name)
        if sa2_index == len(sa2_list) - 1:
            select_many = '&startkey=["' + sa2_name + '"]'
        else:
            select_many = '&startkey=["' + sa2_name + '"]&endkey=["' + sa2_list[sa2_index+1] + '"]'

    if ori_category == 'country' and au_category == 'state' and au_name == 'all':
        country_name = ori_name
        view_index = 'country-state-year'
        select_many = '&startkey=["' + country_name + '","ACT",2001]&endkey=["' + country_name + '","WA",2016]'

    if ori_category == 'country' and au_category == 'state' and au_name in ['2001', '2006', '2011', '2016']:
        view_index = 'year-country-state'
        country_name = ori_name
        search_year = au_name
        select_many = '&startkey=[' + search_year + ',"' + country_name + '","ACT"]&endkey=[' + search_year + ',"' + country_name + '","WA"]'

    url = 'http://wenyi:cloud@localhost:5984/' + database + '/_design/view1/_view/' + view_index + '?stable=false&update=false' + need_group + group_level + select_one + select_many
# &startkey=[2001,"Cambodia","ACT"]&endkey=[2001,"Cambodia","WA"]
    print(url)

    response = requests.get(url, headers=headers)
    response_json = json.loads(response.text)
    data = response_json['rows']

    existing_years = []
    ret = {}
    for key_value in data: # {"key":[2001,"Cambodia","ACT"],"value":221}
        if view_index == 'state-country-year' or view_index == 'sa2-country-year' or view_index == 'country-state-year':
            year = key_value['key'][2]
        else:
            year = key_value['key'][0]
        if year not in existing_years:
            existing_years.append(year)
            ret[str(year)] = {'data': []}
        entry = []
        entry_item_1 = {}
        if view_index == 'country-state-year':
            entry_item_1['name'] = key_value['key'][0]
        else:
            entry_item_1['name'] = key_value['key'][1]
        entry_item_1['value'] = int(key_value['value'])
        entry.append(entry_item_1)
        entry_item_2 = {}
        if view_index == 'state-country-year':
            entry_item_2['name'] = key_value['key'][0]
        elif view_index == 'country-state-year':
            entry_item_2['name'] = key_value['key'][1]
        elif au_name in ['2001', '2006', '2011', '2016']:
            entry_item_2['name'] = key_value['key'][2]
        else:
            entry_item_2['name'] = "Australia"
        entry.append(entry_item_2)
        ret[str(year)]['data'].append(entry)

    return json.dumps(ret)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
