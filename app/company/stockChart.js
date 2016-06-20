define(['jquery', 'highstock', 'domReady'], function ($, Highcharts, domReady) {
    var defaultDayCount = 180;
    var defaultWeekCount = 60;
    var defaultMonthCount = 24;
    var red = '#DD2200';
    var green = '#33AA11';
    var groupingUnits = [
        ['hour', [1]],
        ['day', [1]],
        ['week', [1]],
        ['month', [1]],
        ['year', null]
    ];
    var dataMinTime = 0;
    var relativeWidth = 0;
    var showTips = function (minTime, maxTime, chart) {

    };
    var loadAllData = false;
    var currentStkcd = 'SZ002353';
    var rawData;
    var stockName;

    domReady(function () {
        //修改colum条的颜色（重写了源码方法）
        var originalDrawPoints = Highcharts.seriesTypes.column.prototype.drawPoints;

        Highcharts.seriesTypes.column.prototype.drawPoints = function () {
            var merge = Highcharts.merge,
                series = this,
                chart = this.chart,
                points = series.points,
                i = points.length;

            while (i--) {
                var candlePoint = chart.series[0].points[i];
                if (candlePoint != undefined && candlePoint.open != undefined && candlePoint.close != undefined) { //如果是K线图 改变矩形条颜色，否则不变
                    var color = (candlePoint.open < candlePoint.close) ? red : green;
                    var seriesPointAttr = merge(series.pointAttr);
                    seriesPointAttr[''].fill = color;
                    seriesPointAttr.hover.fill = Highcharts.Color(color).brighten(0.3).get();
                    seriesPointAttr.select.fill = color;
                } else {
                    var seriesPointAttr = merge(series.pointAttr);
                }

                points[i].pointAttr = seriesPointAttr;
            }

            originalDrawPoints.call(this);
        }

        Highcharts.setOptions({
            global: {
                useUTC: false
            },
            lang: {
                rangeSelectorFrom: "日期:",
                rangeSelectorTo: "至",
                rangeSelectorZoom: "",
                loading: '加载中...',

                shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            },
        });

        function afterSetExtremes(e) {
            if (e.min <= dataMinTime && !loadAllData) {
                renderStockChart(currentStkcd, 3);
            }
        }

        var toolTipFormart = function () {
            if (this.y == undefined) {
                return;
            }
            var lastClose = 0;
            var date = Highcharts.dateFormat('%Y-%m-%d', this.x);
            for (var i = 0; i < rawData.length; i++) {
                if (date == rawData[i].day) {
                    lastClose = parseFloat(rawData[i - 1].close);
                    break;
                }
            }

            var open = this.points[0].point.open.toFixed(2);
            var high = this.points[0].point.high.toFixed(2);
            var low = this.points[0].point.low.toFixed(2);
            var close = this.points[0].point.close.toFixed(2);
            //var y = (this.points[1].point.y * 0.0001).toFixed(2);
            //var MA5 = this.points[2].y.toFixed(2);
            //var MA10 = this.points[3].y.toFixed(2);
            //var MA30 = this.points[4].y.toFixed(2);
            relativeWidth = this.points[0].point.shapeArgs.x;

            var tip = '<b>' + Highcharts.dateFormat('%Y-%m-%d  %A', this.x) + '</b><br/>';
            tip += stockName + "<br/>";

            if (open > lastClose) {
                tip += '开盘价：<span style="color: #DD2200;">' + open + ' </span><br/>';
            } else {
                tip += '开盘价：<span style="color: #33AA11;">' + open + ' </span><br/>';
            }
            if (high > lastClose) {
                tip += '最高价：<span style="color: #DD2200;">' + high + ' </span><br/>';
            } else {
                tip += '最高价：<span style="color: #33AA11;">' + high + ' </span><br/>';
            }
            if (low > lastClose) {
                tip += '最低价：<span style="color: #DD2200;">' + low + ' </span><br/>';
            } else {
                tip += '最低价：<span style="color: #33AA11;">' + low + ' </span><br/>';
            }
            if (close > lastClose) {
                tip += '收盘价：<span style="color: #DD2200;">' + close + ' </span><br/>';
            } else {
                tip += '收盘价：<span style="color: #33AA11;">' + close + ' </span><br/>';
            }

            if (close - lastClose > 0) {
                tip += '涨跌额：<span style="color: #DD2200;">' + parseFloat(close - lastClose).toFixed(2) + ' </span><br/>';
            } else {
                tip += '涨跌额：<span style="color: #33AA11;">' + parseFloat(close - lastClose).toFixed(2) + ' </span><br/>';
            }

            var zdf = (parseFloat(close - lastClose) / lastClose * 100).toFixed(2);
            if (zdf > 0) {
                tip += '涨跌幅：<span style="color: #DD2200;">' + zdf + '%' + ' </span><br/>';
            } else {
                tip += '涨跌幅：<span style="color: #33AA11;">' + zdf + '%' + '</span><br/>';
            }
            return tip;
        }

        $('#stockChartContainer').highcharts('StockChart', {
            chart: {
                backgroundColor: null,
                margin: [0, 0, 0, 0],
                plotBorderColor: '#3C94C4',
                plotBorderWidth: 0.3,
                events: {
                    load: function () {

                    }
                }
            },
            title: {
                style: {
                    color: 'black',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            subtitle: {
                style: {
                    color: 'black'
                }
            },
            legend: {
                itemStyle: {
                    fontWeight: 'bold',
                    fontSize: '13px'
                }
            },
            navigator: {
                enabled: false,
                adaptToUpdatedData: false,
                xAxis: {
                    labels: {
                        formatter: function (e) {
                            return Highcharts.dateFormat('%m-%d', this.value);
                        }
                    }
                },
                handles: {
                    backgroundColor: '#808080',
                    //	borderColor: '#268FC9'
                },
                margin: -20
            },
            rangeSelector: {
                enabled: true,
                selected: 1,
                buttons: [{
                    type: 'day',
                    count: defaultDayCount,
                    text: '日K'
                }, {
                    type: 'week',
                    count: defaultWeekCount,
                    text: '周k'
                }, {
                    type: 'month',
                    count: defaultMonthCount,
                    text: '月k'
                }],
                buttonTheme: {
                    width: 72,
                    height: 32,
                    padding: 0,
                    r: 0,
                    stroke: '#68A',
                    display: 'none',
                    zIndex: 7
                },
                inputEnabled: false
            },
            scrollbar: {
                enabled: false
            },
            exporting: {
                enabled: false //设置导出按钮不可用
            },
            credits: {
                enabled: false
            },
            tooltip: {
                formatter: toolTipFormart,
                crosshairs: {
                    dashStyle: 'dash'
                },
                borderColor: 'white',
                positioner: function () { //设置tips显示的相对位置
                    var halfWidth = this.chart.chartWidth / 2; //chart宽度
                    var width = this.chart.chartWidth - 155;
                    var height = this.chart.chartHeight / 5 - 8; //chart高度
                    if (relativeWidth < halfWidth) {
                        return {
                            x: width,
                            y: height
                        };
                    } else {
                        return {
                            x: 30,
                            y: height
                        };
                    }
                },
                shadow: false
            },
            plotOptions: {
                series: {
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    line: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                candlestick: {
                    color: '#33AA11',
                    upColor: '#DD2200',
                    lineColor: '#33AA11',
                    upLineColor: '#DD2200',
                    maker: {
                        states: {
                            hover: {
                                enabled: false,
                            }
                        }
                    }
                },
                map: {
                    shadow: false
                }
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%Y-%m',
                    week: '%Y-%m',
                    month: '%Y-%m'
                },
                events: {
                    afterSetExtremes: afterSetExtremes,
                    setExtremes: function (e) {
                        if (e.rangeSelectorButton != undefined) {
                            var triger = e.rangeSelectorButton;
                            if (triger.type == 'week') {
                                $.each(this.series, function (index, obj) {
                                    obj.options.dataGrouping.units[0] = ['week', [1]];
                                });
                            } else if (triger.type == 'day') {
                                $.each(this.series, function (index, obj) {
                                    obj.options.dataGrouping.units[0] = ['day', [1]];
                                });
                            } else if (triger.type == 'month') {
                                $.each(this.series, function (index, obj) {
                                    obj.options.dataGrouping.units[0] = ['month', [1]];
                                });
                            }
                        }
                    }
                },
                labels: {
                    y: -90,
                    overflow: false,
                    maxStaggerLines: 1,
                    distance: 20
                },
                tickmarkPlacement: 'on'
            },
            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: ''
                },
                height: '70%',
                lineWidth: 2,
                crosshair: {
                    snap: true
                }
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: '成交量'
                },
                top: '75%',
                height: '30%',
                offset: 0,
                lineWidth: 2
            }],

            series: [{
                type: 'candlestick',
                name: '',
                data: [],
                dataGrouping: {
                    approximation: "ohlc",
                    enabled: true,
                    forced: true,
                    units: groupingUnits
                },
                groupPixelWidth: 100
            }, {
                type: 'column',
                name: '成交量',
                data: [],
                yAxis: 1,
                dataGrouping: {
                    approximation: "sum",
                    enabled: true,
                    forced: true,
                    units: groupingUnits
                },
                groupPixelWidth: 100
            }, {
                type: 'spline',
                name: 'MA5',
                color: '#1aadce',
                data: [],
                lineWidth: 1,
                dataGrouping: {
                    approximation: "average",
                    enabled: true,
                    forced: true,
                    units: groupingUnits
                },
                groupPixelWidth: 100
            }, {
                type: 'spline',
                name: 'MA10',
                data: [],
                color: '#8bbc21',
                lineWidth: 1,
                dataGrouping: {
                    approximation: "average",
                    enabled: true,
                    forced: true,
                    units: groupingUnits
                },
                groupPixelWidth: 100
            }, {
                type: 'spline',
                name: 'MA30',
                data: [],
                color: '#910000',
                lineWidth: 1,
                dataGrouping: {
                    approximation: "average",
                    enabled: true,
                    forced: true,
                    units: groupingUnits
                },
                groupPixelWidth: 100
            }]
        });
    });

    function initData(data, ohlc, volume, MA5Array, MA10Array, MA30Array) {
        // split the data set into ohlc and volume
        var dataLength = data.length,
            i = 0;
        // set the allowed units for data grouping

        for (i; i < dataLength; i += 1) {
            ohlc.push([
                Date.parse(data[i].day), // the date
                parseFloat(data[i].open), // open
                parseFloat(data[i].high), // high
                parseFloat(data[i].low), // low
                parseFloat(data[i].close) // close
            ]);

            volume.push([
                Date.parse(data[i].day), // the date
                parseFloat(data[i].volume), // the volume
            ]);

            MA5Array.push([
                Date.parse(data[i].day), // the date
                parseFloat(data[i].ma_price5)
            ]);

            MA10Array.push([
                Date.parse(data[i].day),
                parseFloat(data[i].ma_price10)
            ]);

            MA30Array.push([
                Date.parse(data[i].day),
                parseFloat(data[i].ma_price30)
            ]);
        }
    }

    return {
        render: function (stkcd, name, tempet, datalen) {
            var stockChart = $('#stockChartContainer').highcharts();
            stockName = name;
            stockChart.showLoading('Loading...');

            currentStkcd = stkcd;

            var isGetAll = !(datalen != null && Number(datalen) === datalen && datalen % 1 === 0);
            var self = this;
            $.getJSON("http://query.yahooapis.com/v1/public/yql", {
                q: 'select * from xml where url=\"http://money.finance.sina.com.cn/quotes_service/api/xml.php/CN_MarketData.getKLineData?symbol=' + stkcd + '&scale=240&datalen=' + (isGetAll ? 10000 : datalen) + '\"',
                format: "json"
            }, function (data) {
                if (data.query.count == 0 && tempet > 0) {
                    self.render(stkcd, --tempet, datalen);
                    return;
                }

                loadAllData = isGetAll;

                rawData = data.query.results.root.item;
                var ohlc = [],
                    volume = [],
                    MA5Array = [],
                    MA10Array = [],
                    MA30Array = [];
                initData(rawData, ohlc, volume, MA5Array, MA10Array, MA30Array);

                dataMinTime = Date.parse(rawData[0].day);
                stockChart.series[0].setData(ohlc);
                stockChart.series[1].setData(volume);
                stockChart.series[2].setData(MA5Array);
                stockChart.series[3].setData(MA10Array);
                stockChart.series[4].setData(MA30Array);

                stockChart.hideLoading();
            });
        }
    }
});
