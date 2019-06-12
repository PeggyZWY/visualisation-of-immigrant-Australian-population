$('#estimation-wrapper').width(window.innerWidth);
$('#estimation-wrapper').height(window.innerHeight);

$('#estimation-line-chart').width(window.innerWidth * 0.8);
$('#estimation-line-chart').height(window.innerHeight);

var estimationLineChart = echarts.init(document.getElementById('estimation-line-chart'));

window.onresize = function() {
  $('#estimation-wrapper').width(window.innerWidth);
  $('#estimation-wrapper').height(window.innerHeight);
  $('#estimation-line-chart').width(window.innerWidth * 0.8);
  $('#estimation-line-chart').height(window.innerHeight);
  estimationLineChart.resize();
}

var option = {
  title: {
    text: 'Estimation of Immigrant Australian Population (2016 - 2041)',
    left: 'center',
    textStyle: {
      fontSize: 22
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        precision: 0
      },
    }
  },
  legend: {
    data: ['NSW', 'VIC', 'QLD', 'SA', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
    top: '7%'
  },
  toolbox: {
    itemSize: 20,
    itemGap: 15,
    left: 7,
    feature: {
      dataView: {
        readOnly: true,
        title: "Data View",
        lang: ["Data View", "Close"]
      },
      saveAsImage: {
        title: "Save as Picture"
      },
      magicType: {
        show: true,
        type: ['stack', 'tiled'],
        title: {
          'stack': 'Change to stack',
          'tiled': 'Change to normal'
        }
      },
    }
  },
  grid: {
    left: 10,
    right: 20,
    top: '14%',
    containLabel: true
  },
  xAxis: [{
    type: 'category',
    boundaryGap: false,
    data: ['2016', '2021', '2026', '2031', '2036', '2041']
  }],
  yAxis: [{
    type: 'value'
  }],
  series: [{
    name: 'NSW',
    type: 'line',
    areaStyle: {},
    data: estimationResult['data'][0]
  }, {
    name: 'VIC',
    type: 'line',
    areaStyle: {},
    data: estimationResult['data'][1]
  }, {
    name: 'QLD',
    type: 'line',
    areaStyle: {},
    data: estimationResult['data'][2]
  }, {
    name: 'SA',
    type: 'line',
    areaStyle: {
      normal: {}
    },
    data: estimationResult['data'][3]
  }, {
    name: 'WA',
    type: 'line',
    areaStyle: {
      normal: {}
    },
    data: estimationResult['data'][4]
  }, {
    name: 'TAS',
    type: 'line',
    areaStyle: {
      normal: {}
    },
    data: estimationResult['data'][5]
  }, {
    name: 'NT',
    type: 'line',
    areaStyle: {
      normal: {}
    },
    data: estimationResult['data'][6]
  }, {
    name: 'ACT',
    type: 'line',
    areaStyle: {
      normal: {}
    },
    data: estimationResult['data'][7]
  }]
};

estimationLineChart.setOption(option);