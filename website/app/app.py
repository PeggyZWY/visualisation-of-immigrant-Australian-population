from flask import Flask, jsonify, render_template, url_for

import requests, json

app = Flask(__name__)

headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
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


@app.route('/getjson')
def getjson():
    # data = {'name': 'cats', 'attribute': 'cute'}
    # data = json.dumps(data)
    # return data
    response = requests.get('http://103.6.254.104/getjsonData', headers=headers, verify=False)
    # data_json = json.loads(response.text)
    # return data_json
    return response.text


@app.route('/getjsonData')
def getjsonData():
    data = {'name': 'cats', 'attribute': 'cute'}
    data = json.dumps(data)
    return data


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
