$('#map').width(window.innerWidth);
$('#map').height(window.innerHeight);

var zoom = 1;
var series_2011, series_2016;
var options_list = [];
var allJson = 0;
var worldStatesJson;


var myChart = echarts.init(document.getElementById('map'), 'dark');

echarts.registerMap('world', worldJson);

worldStatesJson = $.extend(worldStatesJson, worldJson);

worldStatesJson["features"] = worldStatesJson["features"].concat(statesJson.data);
echarts.registerMap('worldStates', worldStatesJson);

var geoCoordMap = {
  "China": [121.4648, 31.2891],
  "Cambodia": [104.88659, 11.545469],
  "Australia": [150.993137, -33.675509],
  "United States": [-121.910642, 41.38028], // 国家名必须和captital.js里的国家名一样
  "Canada": [-123.023921, 49.311753]
};

var SHData_2011 = {
  "code": "success",
  "data": [
    [{
      "name": "Cambodia",
      "value": 130
    }, {
      "name": "Australia"
    }],
    [{
      "name": "China",
      "value": 200
    }, {
      "name": "Australia"
    }],
    [{
      "name": "United States",
      "value": 210
    }, {
      "name": "Australia"
    }],
    [{
      "name": "Canada",
      "value": 100
    }, {
      "name": "Australia"
    }]
  ]
};

var SHData_2016 = {
  "code": "success",
  "data": [
    [{
      "name": "Cambodia",
      "value": 50
    }, {
      "name": "Australia"
    }],
    [{
      "name": "China",
      "value": 100
    }, {
      "name": "Australia"
    }],
    [{
      "name": "United States",
      "value": 150
    }, {
      "name": "Australia"
    }],
    [{
      "name": "Canada",
      "value": 200
    }, {
      "name": "Australia"
    }]
  ]
};

var convertDataForLines = function(data) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var dataItem = data[i];
    var fromCoord = geoCoordMap[dataItem[0].name];
    var toCoord = geoCoordMap[dataItem[1].name];
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

var getSeries = function(item, index) {
  series = [];
  // console.log(item);
  series.push({
      type: "lines",
      zlevel: 1,
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
      rippleEffect: {
        //涟漪特效
        period: 5, //动画时间，值越小速度越快
        brushType: "stroke", //波纹绘制方式 stroke, fill
        scale: 4 //波纹圆环最大限制，值越大波纹越大
      },
      label: {
        normal: {
          show: true,
          position: "right", //显示位置
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
        return 6 + val[2] / 100; //圆环大小
      },
      // 涟漪特效的数据
      data: item[1].data.map(function(dataItem) {
        return {
          name: dataItem[0].name,
          value: geoCoordMap[dataItem[0].name].concat([dataItem[0].value])
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
        // TODO: 之后可以改成concat所有到AU的数据
        // value: geoCoordMap[item[0]].concat([100]),
        value: geoCoordMap[item[0]],
        visualMap: false
      }]
    }, {
      type: "map",
      geoIndex: 0,
      data: convertDataForMap(item[1].data)
    });

  switch (item[2]) {
    case 2011:
      series_2011 = $.extend(true, [], series);
      break;
    case 2016:
      series_2016 = $.extend(true, [], series);
      break;
  }
};


[
  ["Australia", SHData_2011, 2011]
].forEach(getSeries);

[
  ["Australia", SHData_2016, 2016]
].forEach(getSeries);


var option = {
  baseOption: {
    timeline: {
      axisType: 'category',
      loop: false,
      playInterval: 1000,
      data: [
        '2011', '2016'
      ]
    },
    backgroundColor: '#404a59',
    title: {
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
    },
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
      right: 20,
      // min: 500000,
      // max: 38000000,
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'] // 颜色是图例从小到大的颜色
      },
      text: ['High', 'Low'], // 文本，默认为数值文本
      calculable: true // true有三角形的那个可以移动
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
  },
  options: [{
    series: series_2011
  }, {
    series: series_2016
  }]
};

myChart.setOption(option);



window.onresize = function() {
  $('#map').width(window.innerWidth);
  $('#map').height(window.innerHeight);
  myChart.resize();
}

myChart.dispatchAction({
  type: 'geoSelect',
  name: "Australia"
});





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

$('#ajaxTest').click(function() {
  $.getJSON("../data/SHData_2016.js", function(result) {
    console.log(result);
    [
      ["Australia", result, 2016]
    ].forEach(getSeries);
    // 下面这个是更新数据的方法：更新所有！
    myChart.setOption({
      options: [{
        series: series_2016
      }, {
        series: series_2016
      }]
    });
  });
});

$('#auMap').click(function() {
  myChart.setOption({
    baseOption: {
      geo: {
        map: 'world'
      }
    }
  });
  myChart.dispatchAction({
    type: "geoUnSelect",
    name: "Victoria"
  });
  myChart.dispatchAction({
    type: "geoSelect",
    name: "Australia"
  })
});

$('#statesMap').click(function() {
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
  myChart.dispatchAction({
    type: "geoSelect",
    name: "Victoria"
  });
  myChart.dispatchAction({
    type: "geoSelect",
    name: "Tasmania"
  });
});

$('#flaskAjax').click(function() {
  $.getJSON("/getjson", function (result) {
    console.log(result);
    console.log(result['attribute']);
  });
});


$("#choose-area-button").click(function(event) {
  $("#choose-area-panel").css("visibility", "visible");
  $("#choose-area-button").css("visibility", "hidden");
})

$("#choose-panel-confirm").click(function(event) {
  console.log("click confirm");
  a = $('form').serializeArray();
  console.log(a);
  alert(JSON.stringify(a, null, 4));
  $("#choose-area-panel").css("visibility", "hidden");
  $("#choose-area-button").css("visibility", "visible");
});

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



