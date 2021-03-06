// the visualisation libraries used in this JavaScript are D3.js (https://d3js.org/) and cartogram.js (http://prag.ma/code/d3-cartogram/cartogram.js)

var stateDict = {
  'NSW': [1, 'New South Wales'],
  'VIC': [2, 'Victoria'],
  'QLD': [3, 'Queensland'],
  'SA': [4, 'South Australia'],
  'WA': [5, 'Western Australia'],
  'TAS': [6, 'Tasmania'],
  'NT': [7, 'Northern Territory'],
  'ACT': [8, 'Australian Capital Territory']
};

var features, path;
var margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
  },
  width = parseInt(d3.select('#chart').style('width')),
  width = width - margin.left - margin.right;

// I need to size this within reason.
// width is not ever going to be bigger than 600 px
// If it's too big, I'm having a hard time figuring out scale and translate

if (width > 600) {
  width = 600;
}

var mapRatio = 1.2,
  height = width * mapRatio;

var tooltip_div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var svg = d3.select("#chart").append("svg")
  .attr("width", width - margin.left - margin.right)
  .attr("height", height - margin.top - margin.bottom);

var counties = svg.append("g")
  .attr("id", "counties")
  .selectAll("path"); // TODO


// works for v3. don't need to rotate by using mercator projection
var projection = d3.geo.mercator()
  .scale(width)
  .translate([-1100, -50]);

var topology,
  geometries,
  carto_features;

var number_formatter = d3.format("0,000");

var pop_data = d3.map();

var carto = d3.cartogram()
  .projection(projection)
  .properties(function(d) {
    return d.properties;
  });

// show normal map
function doNormal() {
  d3.select("#click_to_normal").text("thinking...");

  var features = carto.features(topology, geometries),
    path = d3.geo.path()
    .projection(projection);

  counties.data(features)
    .transition()
    .duration(1500)
    .each("end", function() {
      d3.select("#click_to_normal").text("View Normal")
    })
    .attr("d", path);
};

// show cartogram
function doUpdate() {
  d3.select("#click_to_run").text("thinking...");
  carto.value(function(d) {
    console.log(+pop_data.get(d.properties['STATE_CODE'])[1])
    return +pop_data.get(d.properties['STATE_CODE'])[1];
  });

  if (carto_features == undefined) {
    carto_features = carto(topology, geometries).features;
  }

  counties.data(carto_features)
    .text(function(d) {
      return d.properties.STATE_CODE;
    })

  counties.transition()
    .duration(1500)
    .each("end", function() {
      d3.select("#click_to_run").text("View by Population");
    })
    .attr("d", carto.path);
}

$("#choose-area-button").click(function(event) {
  $("#choose-area-panel-cartogram").css("visibility", "visible");
  $("#choose-area-button").css("visibility", "hidden");
});


$("#choose-panel-confirm").click(function(event) {
  console.log("click confirm");
  formData = $('form').serializeArray();
  console.log(formData);
  $("#choose-area-panel-cartogram").css("visibility", "hidden");
  $("#choose-area-button").css("visibility", "visible");

  originCategory = 'country'
  originName = formData[1]['value'];
  auCategory = 'state';
  auName = 'all';
  auYear = formData[4]['value']
  auName = auYear

  console.log(originCategory, originName, auCategory, auName, auYear);

  // before querying, check whether the countryName is valid (within the droplist options)
  var countries, countriesLen;
  if (auYear == '2001' || auYear == '2006') {
    countries = year_country_dict['01_06'];
  } else {
    countries = year_country_dict['11_16'];
  }

  countriesLen = countries.length;
  var countryNameIsValid = false;
  for (var i = 0; i < countriesLen; i++) {
    if (originName == countries[i]) {
      countryNameIsValid = true;
    }
  }
  // if countryName is not valid, give alert and do not submit query to database
  if (!countryNameIsValid) {
    alert('The country you\'ve chosen is not valid. Please check valid countries in the droplist.');
    return;
  }

  // if countryName is valid, continue to query database
  // form the querying url
  var url = '/getjson/' + originCategory + '/' + originName + '/' + auCategory + '/' + auName;

  $.getJSON(url, function(result) {
    var dataArr = Object.values(result)[0]['data'];
    console.log(dataArr);
    var statesDataThisYear = {
      'data': []
    }
    for (var i = 0; i < dataArr.length; i++) {
      var dataInOneState = dataArr[i];
      var abbr = dataInOneState[1]['name'];
      var tempDict = {};
      tempDict['STATE_CODE'] = stateDict[abbr][0];
      tempDict['STATE_NAME'] = stateDict[abbr][1];
      tempDict['POP'] = dataInOneState[0]['value'];
      statesDataThisYear['data'].push(tempDict);
    }
    console.log(statesDataThisYear);

pop_data = d3.map();
    statesDataThisYear.data.forEach(function(d) {
      pop_data.set(d.STATE_CODE, [d.STATE_NAME, d.POP]);
    });

    topology = topoStates;
    geometries = topology.objects['collection'].geometries;

    features = carto.features(topology, geometries);
    path = d3.geo.path()
      .projection(projection);

    // add this to make up for counties with a space in the name: .replace(/\s+/g, '')
    counties = counties.data(features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("id", function(d) {
        return d.properties.name.replace(/\s+/g, '');
      })
      .attr("fill", "white")
      .attr("d", path)
      .attr("stroke", "black")
      .attr("stroke-width", "0.3px")
      .on("mouseover", function(d) {
        d3.selectAll("#" + d.properties.name.replace(/\s+/g, '')).style("fill", "#99CC33");
        tooltip_div.transition()
          .duration(200)
          .style("opacity", 0.9)
          .style("border", "1px black solid")
        tooltip_div.html(d.properties.name + "<br>" +
            number_formatter(pop_data.get(d.properties['STATE_CODE'])[1]))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style("height", "50px");
      })
      .on("mouseout", function(d) {
        d3.selectAll("#" + d.properties.name.replace(/\s+/g, '')).style("fill", "white");
        tooltip_div.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
});


$("#choose-panel-close").click(function(event) {
  console.log("click close");
  $("#choose-area-panel-cartogram").css("visibility", "hidden");
  $("#choose-area-button").css("visibility", "visible");
});

$("#close").click(function(event) {
  console.log("click close");
  $("#choose-area-panel-cartogram").css("visibility", "hidden");
  $("#choose-area-button").css("visibility", "visible");
});

$("#refresh").click(function() {
  window.location.reload();
});

// the droplist will change with the category
$("#au-year").change(function() {
  console.log('change');
  var formData = $('form').serializeArray();
  var auYear = formData[4]['value'];
  console.log(formData);
  $("#origin-name-options").empty();
  var countries, countriesLen;
  if (auYear == '2001' || auYear == '2006') {
    countries = year_country_dict['01_06'];
  } else {
    countries = year_country_dict['11_16'];
  }
  countriesLen = countries.length;
  for (var i = 0; i < countriesLen; i++) {
    $("#origin-name-options").append('<option value="' + countries[i] + '">' + countries[i] + '</option>');
  }
  $('#origin-name').attr('placeholder', countries[0]);
});

$("#au-year").change();

