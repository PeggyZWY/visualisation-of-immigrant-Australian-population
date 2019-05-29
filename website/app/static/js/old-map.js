$('#map').width(window.innerWidth);
$('#map').height(window.innerHeight);

var myChart = echarts.init(document.getElementById('map'), 'dark');

echarts.registerMap('world', worldJson);

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
        color: '#ffffff'
      }
    },
    tooltip: {
      trigger: 'item',
      transitionDuration: 0.2, // 悬浮的信息框变化位置共用时间
      formatter: function(params) {
        console.log(params);
        var data = params.data;
        if (data != undefined && data.name != undefined && data.value != undefined) {
          return data.name + ': ' + data.value;
        }
      }
    },
    visualMap: {
      left: 'right',
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
      //orient: 'vertical',
      left: 'left',
      top: 'top',
      feature: {
        dataView: {
          readOnly: true
        },
        restore: {},
        saveAsImage: {}
      }
    },
    geo: {
      type: 'map',
      map: 'world',
      aspectScale: 0.85,
      roam: 'move',
      center: [10, 15],
      itemStyle: {
        normal: {
          borderColor: '#111'
        }
      }
    },
    series: [{
      type: "lines",
      coordinateSystem: 'geo',
      zlevel: 2,
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
      }
    }, {
      type: 'map',
      coordinateSystem: 'geo',
      geoIndex: 0
    }],
  },
  options: [{
    series: [{
      data: [{
        coords: [
          [39.894070, 116.397108],
          [-35.280812, 149.130315]
        ]
      }]
    }, {
      data: [{
        name: 'China',
        value: 200
      }, {
        name: 'Canada',
        value: 100
      }]
    }]
  }, {
    series: [{
      data: [
        [{
          coord: [39.894070, 116.397108], // Beijing
          value: 200
        }, {
          coord: [-35.280812, 149.130315] // Canberra
        }],
        [{
          coord: [45.474889, -75.756900], // Ottawa
          value: 200
        }, {
          coord: [-35.280812, 149.130315] // Canberra
        }]
      ]
    }, {
      data: [{
        name: 'China',
        value: 100
      }, {
        name: 'Canada',
        value: 200
      }]
    }]
  }]
}

myChart.setOption(option);



var zoom = 1;

window.onresize = function() {
  $('#map').width(window.innerWidth);
  $('#map').height(window.innerHeight);
  myChart.resize();
}

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
        center: [10, 15]
      }
    }
  });
});