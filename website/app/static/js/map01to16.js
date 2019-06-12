// the visualisation library used in this JavaScript is ECharts (https://echarts.apache.org/en/index.html)

// set the map's width and height equal to the whole browser window's width and height
$('#map').width(window.innerWidth);
$('#map').height(window.innerHeight);

// when browser window is resized, the map size will also change
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
var geoCoordMap = capital;

// get the ECharts instance
var myChart = echarts.init(document.getElementById('map'), 'dark');

// register world map
echarts.registerMap('world', worldJson);

// register world-with-states map
worldStatesJson = $.extend(worldStatesJson, worldJson);
worldStatesJson['features'] = worldStatesJson['features'].concat(statesJson.data);
echarts.registerMap('worldStates', worldStatesJson);

// a helper function to convert data received from database to the format that ECharts needs to draw lines
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

// a helper function
var convertDataForMap = function(data) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var dataItem = data[i];
    res.push(dataItem[0]);
  }
  return res;
};

// a helper function to convert data received from database to the format that ECharts needs to draw bar chart
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
  return [top10CountryValue, top10CountryName];
}

var getSeries = function(item, index) {
  series = [];
  series.push({
      type: "lines", // this line is for trajectory between the country's representive city to Australia
      zlevel: 1,
      silent: true,
      effect: {
        show: true,
        period: 4, // speed of arrow moving
        trailLength: 0.02, // length of the arrow trail. Larger this value, longer the length
        symbol: "arrow",
        symbolSize: 5
      },
      lineStyle: {
        normal: {
          width: 1,
          opacity: 0,
          curveness: 0.3 // the line's curve level
        }
      },
      data: convertDataForLines(item[1].data)
    }, {
      type: "effectScatter", // this scatter is around each country's representive city
      coordinateSystem: "geo",
      zlevel: 2,
      silent: true,
      rippleEffect: { // the effect of ripples
        period: 5, // animation time. Lower this value, higher speed the ripple changes
        brushType: "stroke", // can be 'stroke' or 'fill'
        scale: 4 // the limit for ripple numbers. Larger this value, more ripple there is
      },
      label: {
        normal: {
          show: false, // if set this to true, next to the scatter the country's name will be shown
          position: 'right',
          offset: [5, 0],
          formatter: "{b}",
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
        // the size of scatter. partially decided by population value. therefore, more population results in larger scatter
        return 6 + val[2] / 30000;
      },
      data: item[1].data.map(function(dataItem) {
        return {
          name: dataItem[0].name, // country's name
          value: geoCoordMap[dataItem[0].name][1].concat([dataItem[0].value])
        };
      })
    },
    {
      type: "scatter", // the point in Australia
      coordinateSystem: "geo",
      zlevel: 2,
      rippleEffect: {
        period: 4,
        brushType: "stroke",
        scale: 4
      },
      symbol: "pin", // will show in pin symbol
      symbolSize: 30,
      itemStyle: {
        normal: {
          show: true,
          color: "#9966cc"
        }
      },
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
      type: 'bar', // bar chart at the bottom-left corner for top 10 countries
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

// configuration for ECharts
var option = {
  baseOption: {
    timeline: { // timeline on the bottom
      axisType: 'category',
      loop: false,
      playInterval: 1000,
      data: [
        '2001', '2006', '2011', '2016'
      ]
    },
    backgroundColor: '#404a59', // background color
    title: [{ // main title. will change when data comes
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
    }, { // title for top 10 countries. will change when data comes
      id: 'top10',
      text: '',
      bottom: 285,
      left: 16
    }],
    tooltip: { // a triangle tooltip over the country to show country name and immigrant population
      trigger: 'item',
      transitionDuration: 0.2, // durition of tooltip changing position
      formatter: function(params) {
        if (params.seriesType == "map") {
          var data = params.data;
          if (data != undefined && data.name != undefined && data.value != undefined) {
            return data.name + ': ' + data.value; // show country name and immigrant population
          }
        }
      }
    },
    visualMap: { // the legend at the bottom-right corner. the color is related to the color of countries on the map
      zlevel: 5,
      right: 20,
      min: 0,
      max: 0,
      backgroundColor: 'rgba(223, 223, 223, 0.6)',
      inRange: {
        // color for legend from bottom to top
        color: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58']
      },
      text: ['High', 'Low'],
      textStyle: {
        fontSize: 14,
        textBorderWidth: 0.3,
        textBorderColor: 'black'
      },
    },
    toolbox: { // toolboxs at the top-left corner. two functions here: dataView and saveAsImage
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
    geo: { // geo basic information: world map
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
    xAxis: { // x-axis for the bar chart at the bottom-left corner
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
    yAxis: { // y-axis for the bar chart at the bottom-left corner
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
    grid: { // configure the bar chart's position
      left: 20,
      bottom: 30,
      width: 200,
      height: 250
    },
  },
  options: [] // will be configured when data is responsed from the database. scripts are below
};

// set the configuration option to the ECharts instance
myChart.setOption(option);


// button for zooming in the map
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

// button for zooming in the map
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

// resize to the original size for the map
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

// open the panel for choosing Australia area
$("#choose-area-button").click(function(event) {
  $("#choose-area-panel").css("visibility", "visible");
  $("#choose-area-button").css("visibility", "hidden");
});

// 'confirm' button in the panel for choosing Australia area
$("#choose-panel-confirm").click(function(event) {
  $("#choose-area-panel").css("visibility", "hidden");
  $("#choose-area-button").css("visibility", "visible");

  // get what the user has input
  formData = $('form').serializeArray();
  originCategory = formData[0]['value'];
  originName = formData[1]['value'];
  auCategory = formData[2]['value'];
  auName = formData[3]['value'];

  if (originName.replace(/(^\s*)|(\s*$)/g, '') == '') {
    originName = 'all'
  }

  if (auName.replace(/(^\s*)|(\s*$)/g, '') == '') {
    auName = 'all'
  }
  console.log(originCategory, originName, auCategory, auName);

  // form the querying url
  var url = '/getjson/' + originCategory + '/' + originName + '/' + auCategory + '/' + auName;
  console.log(url);

  // send the AJAX query to Flask. Flask will receive this url, and in its rounting function it will query the CouchDB database
  $.getJSON(url, function(result) {
    // once get response successfully, format the responsed data to the form ECharts needs
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

    // since for each query, the immigrantpopulation can vary a lot, so calculate a nearest value for the max population and set it to the highest value for the visualMap legend
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

    if (auCategory == 'sa2') {
      destination = Object.keys(statesDict)[sa2_dict[auName][0]-1];
    }

    // form the series data
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
    } else { // 'auCategory' is 'state' or 'sa2'
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

    // this is for updating partial configuration options
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

// close the panel for choosing Australia area when clicking these two buttons
$("#choose-panel-close, #close").click(function(event) {
  console.log("click close");
  $("#choose-area-panel").css("visibility", "hidden");
  $("#choose-area-button").css("visibility", "visible");
});

// the droplist will change with the category
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

// the droplist will change with the category
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

// set default placeholder
$('#origin-name').attr('placeholder', 'all');
$('#au-name').attr('placeholder', 'whole Australia');
$('#au-name').attr('readonly', 'readonly');