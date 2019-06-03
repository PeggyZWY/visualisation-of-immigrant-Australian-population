$('#map').width(window.innerWidth);
$('#map').height(window.innerHeight);

window.onresize = function() {
  $('#map').width(window.innerWidth);
  $('#map').height(window.innerHeight);
  myChart.resize();
}


var zoom = 1;
var series_2001, series_2006, series_2011, series_2016;
var top10Name_2001, top10Name_2006, top10Name_2011, top10Name_2016;
var options_list = [];
var allJson = 0;
var worldStatesJson;
var statesDict = {
  'NSW': 'New South Wales',
  'VIC': 'Victoria',
  'QLD': 'Queensland',
  'SA': 'South Australia',
  'WA': 'Western Australia',
  'TAS': 'Tasmania',
  'NT': 'Northern Territory',
  'ACT': 'Australian Capital Territory'
};
var destination;
var originCategory, originName, auCategory, auName;

var TBP;



var myChart = echarts.init(document.getElementById('map'), 'dark');

echarts.registerMap('world', worldJson);

worldStatesJson = $.extend(worldStatesJson, worldJson);

worldStatesJson['features'] = worldStatesJson['features'].concat(statesJson.data);
echarts.registerMap('worldStates', worldStatesJson);


var geoCoordMap = capital;


var convertDataForLines = function(data) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var dataItem = data[i];
    var fromCoord = geoCoordMap[dataItem[0].name][1];
    var toCoord = geoCoordMap[dataItem[1].name][1];
    if (fromCoord && toCoord) {
      res.push([{
        coord: fromCoord,
        value: dataItem[0].value
      }, {
        coord: toCoord
      }]);
    }
  }
  return res;
};

var convertDataForMap = function(data) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var dataItem = data[i];
    res.push(dataItem[0]);
  }
  return res;
};

var convertDataForBar = function(data) {
  var dict = {};
  for (var i = 0; i < data.length; i++) {
    var dataItem = data[i];
    dict[dataItem[0]['value']] = dataItem[0]['name'];
  }
  var countryValue = Object.keys(dict);
  countryValue.sort(function(a, b) {
    return b - a;
  });
  var top10CountryValue = [];
  for (var i = 0; i < 10; i++) {
    top10CountryValue.push(countryValue[i]);
  }
  top10CountryValue.reverse();
  var top10CountryName = [];
  for (var i = 0; i < 10; i++) {
    top10CountryName.push(dict[top10CountryValue[i]]);
  }
  // console.log([top10CountryValue, top10CountryName]);
  return [top10CountryValue, top10CountryName];
}

var getSeries = function(item, index) {
  series = [];
  series.push({
      type: "lines",
      zlevel: 1,
      silent: true,
      effect: {
        show: true,
        period: 4, //箭头指向速度，值越小速度越快
        trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
        symbol: "arrow", //箭头图标
        symbolSize: 5 //图标大小
      },
      lineStyle: {
        normal: {
          width: 1, //尾迹线条宽度
          opacity: 0, //尾迹线条透明度
          curveness: 0.3 //尾迹线条曲直度
        }
      },
      // 攻击线的数据
      data: convertDataForLines(item[1].data)
    }, {
      type: "effectScatter",
      coordinateSystem: "geo",
      zlevel: 2,
      silent: true,
      rippleEffect: {
        //涟漪特效
        period: 5, //动画时间，值越小速度越快
        brushType: "stroke", //波纹绘制方式 stroke, fill
        scale: 4 //波纹圆环最大限制，值越大波纹越大
      },
      label: {
        normal: {
          // show: true,
          show: false,
          position: 'right', //显示位置
          offset: [5, 0], //偏移设置
          formatter: "{b}", //圆环显示文字
          color: "green",
          shadowColor: "rgba(0, 0, 0, 1)"
        }
      },
      itemStyle: {
        borderColor: "white",
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowBlur: 10
      },
      symbolSize: function(val) {
        return 6 + val[2] / 30000; //圆环大小
      },
      // 涟漪特效的数据
      data: item[1].data.map(function(dataItem) {
        return {
          name: dataItem[0].name, // 圈旁边的国家名，注释掉就不显示国家名
          value: geoCoordMap[dataItem[0].name][1].concat([dataItem[0].value])
        };
      })
    },
    //被攻击点
    {
      type: "scatter",
      coordinateSystem: "geo",
      zlevel: 2,
      rippleEffect: {
        period: 4,
        brushType: "stroke",
        scale: 4
      },
      symbol: "pin",
      symbolSize: 30,
      itemStyle: {
        normal: {
          show: true,
          color: "#9966cc"
        }
      },
      // 被攻击点的数据
      data: [{
        name: item[0],
        value: geoCoordMap[item[0]][1],
        visualMap: false
      }]
    }, {
      type: "map",
      geoIndex: 0,
      data: convertDataForMap(item[1].data)
    }, {
      type: 'bar',
      zlevel: 5,
      silent: true,
      data: convertDataForBar(item[1].data)[0],
      label: {
        normal: {
          show: true,
          position: 'insideLeft',
          textStyle: {
            color: 'rgb(10, 31, 86)',
            fontWeight: 'bold',
            fontSize: 14
          },
          textBorderWidth: 1,
          textBorderColor: 'rgb(255, 254, 219)',
          formatter: function(params) {
            return params.name + ': ' + params.value
          }
        }
      },
      itemStyle: {
        // borderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 5
      }
    });

  switch (item[2]) {
    case 2001:
      series_2001 = $.extend(true, [], series);
      top10Name_2001 = convertDataForBar(item[1].data)[1];
      break;
    case 2006:
      series_2006 = $.extend(true, [], series);
      top10Name_2006 = convertDataForBar(item[1].data)[1];
      break;
    case 2011:
      series_2011 = $.extend(true, [], series);
      top10Name_2011 = convertDataForBar(item[1].data)[1];
      break;
    case 2016:
      series_2016 = $.extend(true, [], series);
      top10Name_2016 = convertDataForBar(item[1].data)[1];
      break;
  }
};


var option = {
  baseOption: {
    timeline: {
      axisType: 'category',
      loop: false,
      playInterval: 1000,
      data: [
        '2001', '2006', '2011', '2016'
      ]
    },
    backgroundColor: '#404a59',
    title: [{
      id: 'mainTitle',
      text: 'Visualisation of Immigrant Australian Population',
      subtext: 'Data from ABS Census',
      sublink: 'https://www.abs.gov.au/census',
      left: 'center',
      itemGap: 6,
      top: 10,
      textStyle: {
        fontSize: 22,
        color: "#fff"
      }
    }, {
      id: 'top10',
      text: '',
      bottom: 285,
      left: 16
    }],
    tooltip: {
      trigger: 'item',
      transitionDuration: 0.2, // 悬浮的信息框变化位置共用时间
      formatter: function(params) {
        if (params.seriesType == "map") {
          var data = params.data;
          if (data != undefined && data.name != undefined && data.value != undefined) {
            return data.name + ': ' + data.value;
          }
        }
      }
    },
    visualMap: {
      zlevel: 5,
      right: 20,
      min: 0,
      max: 0,
      backgroundColor: 'rgba(223, 223, 223, 0.6)',
      inRange: {
        // 颜色是图例从小到大的颜色
        color: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58']
      },
      text: ['High', 'Low'], // 文本，默认为数值文本
      textStyle: {
        fontSize: 14,
        textBorderWidth: 0.3,
        textBorderColor: 'black'
      },
      // calculable: true // true有三角形的那个可以移动
    },
    toolbox: {
      show: true,
      itemSize: 20,
      itemGap: 15,
      left: 15,
      top: 5,
      feature: {
        dataView: {
          readOnly: true,
          title: "Data View",
          lang: ["Data View", "Close"]
        },
        saveAsImage: {
          title: "Save as Picture"
        }
      }
    },
    geo: {
      type: 'map',
      map: 'world',
      aspectScale: 0.85,
      roam: 'move',
      center: [10, 20],
      selectedMode: true,
      itemStyle: {
        normal: {
          areaColor: '#323c48',
          borderColor: '#111'
        }
      }
    },
    xAxis: {
      type: 'value',
      max: 'dataMax',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      zlevel: 9,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    grid: {
      left: 20,
      bottom: 30,
      width: 200,
      height: 250
    },
  },
  options: []
};

myChart.setOption(option);



$('#zoom-in').click(function() {
  zoom += 1;
  myChart.setOption({
    baseOption: {
      geo: {
        zoom: zoom
      }
    }
  });
});

$('#zoom-out').click(function() {
  zoom -= 1;
  if (zoom < 1) {
    zoom = 1;
  }
  myChart.setOption({
    baseOption: {
      geo: {
        zoom: zoom
      }
    }
  });
});

$('#reset-zoom').click(function() {
  zoom = 1;
  myChart.setOption({
    baseOption: {
      geo: {
        zoom: zoom,
        center: [10, 20]
      }
    }
  });
});



$("#choose-area-button").click(function(event) {
  $("#choose-area-panel").css("visibility", "visible");
  $("#choose-area-button").css("visibility", "hidden");
});


$("#choose-panel-confirm").click(function(event) {
  console.log("click confirm");
  formData = $('form').serializeArray();
  console.log(formData);
  console.log(JSON.stringify(formData, null, 4));
  $("#choose-area-panel").css("visibility", "hidden");
  $("#choose-area-button").css("visibility", "visible");

  originCategory = formData[0]['value'];
  originName = formData[1]['value'];
  auCategory = formData[2]['value'];
  auName = formData[3]['value'];

  console.log(originCategory, originName, auCategory, auName);

  if (originName.replace(/(^\s*)|(\s*$)/g, '') == '') {
    originName = 'all'
  }

  if (auName.replace(/(^\s*)|(\s*$)/g, '') == '') {
    auName = 'all'
  }
  console.log(originCategory, originName, auCategory, auName);


  var url = '/getjson/' + originCategory + '/' + originName + '/' + auCategory + '/' + auName;
  console.log(url);
  $.getJSON(url, function(result) {
    TBP = result;
    console.log(TBP);

    var tempArr = [];
    for (year in result) {
      data = result[year]['data'];
      for (var i = 0; i < data.length; i++) {
        tempArr.push(data[i][0]['value']);
      }
    }
    tempArr.sort(function(a, b) {
      return b - a;
    });

    var maxIndex = Math.floor(tempArr.length * 0.1);
    var visualMapMax = tempArr[maxIndex];

    var getNearestMax = function(num) {
      var retArr = [];
      var digits = ('' + num).split(''),
        len = digits.length,
        firstDigit = digits[0];

      retArr[0] = parseInt(firstDigit) + 1 + '';
      for (var i = 1; i < len; i++) {
        retArr.push('0');
      }

      return parseInt(retArr.join(''));
    }

    visualMapMax = getNearestMax(visualMapMax);


    destination = result['2011']['data'][0][1]['name'];

    [
      [destination, result['2001'], 2001]
    ].forEach(getSeries);
    [
      [destination, result['2006'], 2006]
    ].forEach(getSeries);
    [
      [destination, result['2011'], 2011]
    ].forEach(getSeries);
    [
      [destination, result['2016'], 2016]
    ].forEach(getSeries);

    if (destination in statesDict) {
      destination = statesDict[destination];
    }
    if (auCategory == 'country') {
      myChart.setOption({
        baseOption: {
          geo: {
            map: 'world'
          }
        }
      });

      myChart.dispatchAction({
        type: "geoSelect",
        name: "Australia"
      });
      for (state in statesDict) {
        myChart.dispatchAction({
          type: "geoUnSelect",
          name: statesDict[state]
        });
      }
    }

    if (auCategory == 'state') {
      myChart.setOption({
        baseOption: {
          geo: {
            map: "worldStates"
          }
        }
      });

      myChart.dispatchAction({
        type: "geoUnSelect",
        name: "Australia"
      });

      for (state in statesDict) {
        myChart.dispatchAction({
          type: "geoUnSelect",
          name: statesDict[state]
        });
      }

      myChart.dispatchAction({
        type: "geoSelect",
        name: destination
      });
    }

    var toInTop10Title = destination;
    if (auCategory == 'sa2') {
      toInTop10Title = auName;
    }

    // 下面这个是更新数据的方法：更新所有！
    myChart.setOption({
      baseOption: {
        visualMap: {
          max: visualMapMax
        }
      },
      options: [{
        title: [{
          id: 'mainTitle',
          text: 'Visualisation of Immigrant Australian Population - 2001'
        }, {
          id: 'top10',
          text: 'Top 10 - 2001 - to ' + toInTop10Title
        }],
        yAxis: {
          data: top10Name_2001
        },
        series: series_2001
      }, {
        title: [{
          id: 'mainTitle',
          text: 'Visualisation of Immigrant Australian Population - 2006'
        }, {
          id: 'top10',
          text: 'Top 10 - 2006 - to ' + toInTop10Title
        }],
        yAxis: {
          data: top10Name_2006
        },
        series: series_2006
      }, {
        title: [{
          id: 'mainTitle',
          text: 'Visualisation of Immigrant Australian Population - 2011'
        }, {
          id: 'top10',
          text: 'Top 10 - 2011 - to ' + toInTop10Title
        }],
        yAxis: {
          data: top10Name_2011
        },
        series: series_2011
      }, {
        title: [{
          id: 'mainTitle',
          text: 'Visualisation of Immigrant Australian Population - 2016'
        }, {
          id: 'top10',
          text: 'Top 10 - 2016 - to ' + toInTop10Title
        }],
        yAxis: {
          data: top10Name_2016
        },
        series: series_2016
      }]
    });
  });
});

$("#choose-panel-confirm").click();



$("#choose-panel-close").click(function(event) {
  console.log("click close");
  $("#choose-area-panel").css("visibility", "hidden");
  $("#choose-area-button").css("visibility", "visible");
});

$("#close").click(function(event) {
  console.log("click close");
  $("#choose-area-panel").css("visibility", "hidden");
  $("#choose-area-button").css("visibility", "visible");
});



$("#origin-category").change(function() {
  console.log('change');
  formData = $('form').serializeArray();
  if (formData[0]['value'] == 'world') {
    $('#origin-name').attr('placeholder', 'whole world');
    $('#origin-name').attr('readonly', 'readonly');
  } else {
    $('#origin-name').attr('placeholder', '');
    $('#origin-name').removeAttr('readonly');
  }
  console.log(formData);
});


$("#au-category").change(function() {
  console.log('change');
  formData = $('form').serializeArray();
  var auCategory = formData[2]['value'];
  if (auCategory == 'country') {
    $('#au-name').attr('placeholder', 'whole Australia');
    $('#au-name').attr('readonly', 'readonly');
  } else {
    $('#au-name').attr('placeholder', '');
    $('#au-name').removeAttr('readonly');

    $("#au-name-options").empty();
    if (auCategory == 'state') {
      Object.keys(statesDict).forEach(function(key) {
        $("#au-name-options").append('<option value="' + key + '">' + statesDict[key] + '</option>');
      });
    } else {
      Object.keys(sa2_dict).forEach(function(key) {
        $("#au-name-options").append('<option value="' + key + '">' + sa2_dict[key] + '</option>');
      });
    }
  }
  console.log(formData);
});


$('#origin-name').attr('placeholder', 'all');

$('#au-name').attr('placeholder', 'whole Australia');
$('#au-name').attr('readonly', 'readonly');