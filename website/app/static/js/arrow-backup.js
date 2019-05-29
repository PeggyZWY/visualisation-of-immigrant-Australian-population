$("body").css("margin", 0);
$("#main").width(window.innerWidth);
$("#main").height(window.innerHeight);

var myChart = echarts.init(document.getElementById('main'), 'dark');

echarts.registerMap('world', worldJson);

var geoCoordMap = {
    上海: [121.4648, 31.2891],
    尼日利亚: [-4.388361, 11.186148],
    美国洛杉矶: [-118.24311, 34.052713],
    香港邦泰: [114.195466, 22.282751],
    美国芝加哥: [-87.801833, 41.870975],
    加纳库马西: [-4.62829, 7.72415],
    英国曼彻斯特: [-1.657222, 51.886863],
    德国汉堡: [10.01959, 54.38474],
    哈萨克斯坦阿拉木图: [45.326912, 41.101891],
    俄罗斯伊尔库茨克: [89.116876, 67.757906],
    巴西: [-48.678945, -10.493623],
    埃及达米埃塔: [31.815593, 31.418032],
    西班牙巴塞罗纳: [2.175129, 41.385064],
    柬埔寨金边: [104.88659, 11.545469],
    意大利米兰: [9.189948, 45.46623],
    乌拉圭蒙得维的亚: [-56.162231, -34.901113],
    莫桑比克马普托: [32.608571, -25.893473],
    阿尔及利亚阿尔及尔: [3.054275, 36.753027],
    阿联酋迪拜: [55.269441, 25.204514],
    匈牙利布达佩斯: [17.108519, 48.179162],
    澳大利亚悉尼: [150.993137, -33.675509],
    美国加州: [-121.910642, 41.38028],
    澳大利亚墨尔本: [144.999416, -37.781726],
    墨西哥: [-99.094092, 19.365711],
    加拿大温哥华: [-123.023921, 49.311753]
};

var SHData = [
    [{
        name: "尼日利亚",
        value: 1
    }, {
        name: "上海"
    }],
    [{
        name: "美国洛杉矶",
        value: 2
    }, {
        name: "上海"
    }],
    [{
        name: "香港邦泰",
        value: 3
    }, {
        name: "上海"
    }],
    [{
        name: "美国芝加哥",
        value: 4
    }, {
        name: "上海"
    }],
    [{
        name: "加纳库马西",
        value: 5
    }, {
        name: "上海"
    }],
    [{
        name: "英国曼彻斯特",
        value: 6
    }, {
        name: "上海"
    }],
    [{
        name: "德国汉堡",
        value: 7
    }, {
        name: "上海"
    }],
    [{
        name: "哈萨克斯坦阿拉木图",
        value: 8
    }, {
        name: "上海"
    }],
    [{
        name: "俄罗斯伊尔库茨克",
        value: 9
    }, {
        name: "上海"
    }],
    [{
        name: "巴西",
        value: 10
    }, {
        name: "上海"
    }],
    [{
        name: "埃及达米埃塔",
        value: 11
    }, {
        name: "上海"
    }],
    [{
        name: "西班牙巴塞罗纳",
        value: 12
    }, {
        name: "上海"
    }],
    [{
        name: "柬埔寨金边",
        value: 13
    }, {
        name: "上海"
    }],
    [{
        name: "意大利米兰",
        value: 14
    }, {
        name: "上海"
    }],
    [{
        name: "乌拉圭蒙得维的亚",
        value: 15
    }, {
        name: "上海"
    }],
    [{
        name: "莫桑比克马普托",
        value: 16
    }, {
        name: "上海"
    }],
    [{
        name: "阿尔及利亚阿尔及尔",
        value: 17
    }, {
        name: "上海"
    }],
    [{
        name: "阿联酋迪拜",
        value: 18
    }, {
        name: "上海"
    }],
    [{
        name: "匈牙利布达佩斯",
        value: 19
    }, {
        name: "上海"
    }],
    [{
        name: "澳大利亚悉尼",
        value: 20
    }, {
        name: "上海"
    }],
    [{
        name: "美国加州",
        value: 21
    }, {
        name: "上海"
    }],
    [{
        name: "澳大利亚墨尔本",
        value: 22
    }, {
        name: "上海"
    }],
    [{
        name: "墨西哥",
        value: 23
    }, {
        name: "上海"
    }],
    [{
        name: "加拿大温哥华",
        value: 24
    }, {
        name: "上海"
    }]
];

var res = [];
var convertData = function(data) {
    console.log(data);
    // var res = [];
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
    console.log(res);
    return res;
};

var series = [];

[
    ["上海", SHData]
].forEach(function(item, i) {
    // console.log(item);
    series.push({
            type: "lines",
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
            },
            // 攻击线的数据
            data: convertData(item[1])
        }, {
            type: "effectScatter",
            coordinateSystem: "geo",
            zlevel: 2,
            rippleEffect: {
                //涟漪特效
                period: 4, //动画时间，值越小速度越快
                brushType: "stroke", //波纹绘制方式 stroke, fill
                scale: 4 //波纹圆环最大限制，值越大波纹越大
            },
            label: {
                normal: {
                    show: true,
                    position: "right", //显示位置
                    offset: [5, 0], //偏移设置
                    formatter: "{b}" //圆环显示文字
                },
                emphasis: {
                    show: true
                }
            },
            symbol: "circle",
            symbolSize: function(val) {
                return 4 + val[2] / 1000; //圆环大小
            },
            itemStyle: {
                normal: {
                    show: false,
                }
            },
            // 涟漪特效的数据
            data: item[1].map(function(dataItem) {
                // console.log(dataItem);
                console.log(geoCoordMap[dataItem[0].name].concat([dataItem[0].value]));
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
            label: {
                normal: {
                    show: true,
                    position: "right",
                    color: "#00ffff",
                    formatter: "{b}",
                    textStyle: {
                        color: "#0bc7f3"
                    }
                },
                emphasis: {
                    show: true
                }
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
                // TODO: 不懂.concat([100])
                value: geoCoordMap[item[0]].concat([100])
            }]
        });
});

option = {
    backgroundColor: '#000',
    tooltip: {
        trigger: "item",
        backgroundColor: "#1540a1",
        borderColor: "#FFFFCC",
        showDelay: 0,
        hideDelay: 0,
        enterable: true,
        transitionDuration: 0,
        extraCssText: "z-index:100",
        // 这个有问题，显示是给攻击线显示的，我想要的是显示国家
        formatter: function(params, ticket, callback) {
            console.log(params);

            //根据业务自己拓展要显示的内容
            var res = "";
            var name = params.name;
            // var value = params.value[params.seriesIndex + 1];
            var value = params.value;
            res =
                "<span style='color:#fff;'>" +
                name +
                "</span><br/>数据：" +
                value;
            return res;
        }
    },
    visualMap: {
        //图例值控制
        min: 0,
        max: 10000,
        show: false,
        calculable: true,
        color: ["#0bc7f3"],
        textStyle: {
            color: "#fff"
        },

    },
    geo: {
        map: "world",
        label: {
            emphasis: {
                show: false
            }
        },
        roam: true, //是否允许缩放
        layoutCenter: ["50%", "50%"], //地图位置
        layoutSize: "180%",
        itemStyle: {
            normal: {
                color: "#04284e", //地图背景色
                borderColor: "#5bc1c9" //省市边界线
            },
            emphasis: {
                color: "rgba(37, 43, 61, .5)" //悬浮背景
            }
        }
    },

    series: series
};

myChart.setOption(option);