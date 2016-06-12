/**
 * Created by cxh on 2016/5/20.
 */

define(['jquery', 'chartjs'], function ($, Chart) {
    var chartGroup = [
        {
            column: {
                营业收入: 'bar',
                扣非净利润: 'bar'
            }
        },
        {
            column: {
                营业收入增长率: 'line',
                净利润增长率: 'line'
            }
        },
        {
            column: {
                毛利率: 'line',
                扣非净利润率: 'line'
            }
        },
        {
            column: {
                三项费用率: 'line',
                销售费用率: 'bar',
                管理费用率: 'bar',
                财务费用率: 'bar'
            },
            option: {
                stack: true,
                hideText: ['销售费用率', '管理费用率', '财务费用率']
            }
        },
        {
            column: {
                资产负债率: 'line',
                固定资产比重: 'line'
            }
        },
        {
            column: {
                流动比率: 'line',
                速动比率: 'line'
            }
        },
        {
            column: {
                净资产收益率ROE: 'line',
                总资产收益率: 'line'
            }
        },
        {
            column: {
                存货周转率: 'line',
                应收账款周转率: 'line'
            }
        }];

    var chartColor = ['rgba(91,144,191,1)', 'rgba(191,97,106,1)', 'rgba(236,173,50,1)', 'rgba(94,161,128,1)', 'rgba(217,99,59,1)', 'rgba(255,51,51,1)', 'rgba(77,182,224,1)', 'rgba(254,135,134,1)'];

    var chartData = {};

    function renderChart(container, datasets, options, years) {
        options.animation = {
            onComplete: function () {
                var chartInstance = this.chart;
                var ctx = chartInstance.ctx;
                ctx.textAlign = "center";

                Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                    if (!dataset.hideText) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        Chart.helpers.each(meta.data.forEach(function (bar, index) {
                            var fontSize = chartInstance.width * 20 / 1000 + 'px';
                            ctx.font = fontSize + " Times New Roman";
                            ctx.fillText(Math.abs(dataset.data[index]) < 10 ? dataset.data[index].toFixed(1) : dataset.data[index].toFixed(0), bar._model.x, bar._model.y - 10);
                        }), this)
                    }
                }), this);
            }
        };
        var chart = new Chart(container, {
            type: 'bar',
            data: {
                labels: years,
                datasets: datasets,
            },
            options: options
        });

        return chart;
    }

    function randomColorFactor() {
        return Math.round(Math.random() * 255);
    }

    return {
        getData : function(){
            return chartData
        },
        render: function (container, customColumnFormula, years) {
            $.each(chartGroup, function (i) {
                var datasets = [];
                var count = 0;
                $.each(this['column'], function (columnName, type) {
                    var background = count < chartColor.length ? chartColor[count] : 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',0.5)'
                    var dataset = {
                        column: columnName,
                        type: type,
                        fill: type != 'line',
                        label: customColumnFormula[columnName][1] == '' ? columnName : columnName + '(' + customColumnFormula[columnName][1] + ')',
                        data: chartData[columnName],
                        backgroundColor: background,
                        borderColor: background,
                        pointBackgroundColor: background,
                        pointBorderWidth: 2,
                    };
                    count++;

                    if (chartGroup[i].option && chartGroup[i].option.hideText) {
                        if ($.inArray(columnName, chartGroup[i].option.hideText) != -1) {
                            dataset.hideText = true;
                        }
                    }

                    datasets.push(dataset);
                });

                var ct = $('<canvas>');
                container.append(ct);
                var options = {};
                if (this.option != undefined) {
                    if (this.option.stack) {
                        options.scales = {
                            xAxes: [{
                                stacked: true
                            }],
                            yAxes: [{
                                stacked: true
                            }]
                        }
                    }

                    if (this.option.multiAxis) {
                        $.each(this.option.multiAxis, function (i, multiAxisColumn) {
                            $.each(datasets, function () {
                                if (this.column == multiAxisColumn) {
                                    this.yAxisID = "y-axis-2";
                                } else {
                                    this.yAxisID = "y-axis-1";
                                }
                            });
                        });

                        options.scales = {
                            yAxes: [{
                                type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                                display: true,
                                position: "left",
                                id: "y-axis-1",
                                stacked: this.option.stack ? true : false
                            }, {
                                type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                                display: true,
                                position: "right",
                                id: "y-axis-2",

                                // grid line settings
                                gridLines: {
                                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                                },
                            }],
                        }
                    }
                }
                renderChart(ct, datasets, options, years);
            });
        },
        resetData: function() {
            $.each(chartData, function(columnName){
                chartData[columnName] = [];
            })
        },
        addColumnData: function(columnName, data) {
            if(chartData[columnName] instanceof Array) {
                chartData[columnName].push(data);
            } else {
                chartData[columnName] = [];
                chartData[columnName].push(data);
            }
        }
    };
});
