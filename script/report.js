/**
 * Created by cxh on 2016/4/25.
 */
// for custom column year
var customDataYear = [];
// for custom column data extract from financial report
var customData = {};
// avoid duplicate load data
var customDataLoadedColumn = [];

// cunstom column name and formula to calcuate from custom data.
var unit = {
    万:0.01,
    百万:100,
    亿:10000,
}

var customColumnFormula = {
    营业收入: ['营业收入', '亿'],
    营业收入增长率 : ['营业总收入同比增长率', '%'],
    毛利率 : ['销售毛利率', '%'],
    三项费用率 : ['(管理费用+销售费用+财务费用)/营业收入', '%'],
    销售费用率 : ['销售费用/营业收入', '%'],
    管理费用率 : ['管理费用/营业收入', '%'],
    财务费用率 : ['财务费用/营业收入', '%'],
    扣非净利润 : ['扣非净利润', '亿'],
    扣非净利润率: ['扣非净利润/营业收入', '%'],
    净利润增长率 : ['(净利润-上一年净利润)/上一年净利润', '%'],
    资产负债率 : ['资产负债比率', '%'],
    流动比率 : ['流动比率', ''],
    速动比率 : ['速动比率', ''],
    存货周转率 : ['存货周转率', ''],
    应收账款周转率 : ['360/应收账款周转天数', ''],
    固定资产比重 : ['固定资产/资产总计', '%'],
    净资产收益率ROE : ['净资产收益率', '%'],
    总资产收益率 : ['净利润/资产总计', '%'],
    经营性现金流净额比净利润:['经营现金流量净额/净利润', '']
};

var chartGroup = [{column:{营业收入:'bar',营业收入增长率:'line',扣非净利润:'bar',净利润增长率:'line'}, option:{multiAxis:['营业收入增长率','净利润增长率']}},
    {column:{毛利率:'line',扣非净利润率:'line'}},
    {column:{三项费用率:'line',销售费用率:'bar',管理费用率:'bar',财务费用率:'bar'},option:{stack:true}},
    {column:{资产负债率:'line',流动比率:'line',速动比率:'line', 固定资产比重:'line'},multiAxis:['流动比率','速动比率']},
    {column:{资产负债率:'line', 流动比率:'line', 速动比率:'line', 固定资产比重:'line'}},
    {column:{净资产收益率ROE:'line', 资产负债率:'line', 扣非净利润率:'line', 总资产收益率:'line'}},
    {column:{存货周转率:'line', 应收账款周转率:'line'}}];

var chartData = {};

var chartColor = ['rgba(91,144,191,1)','rgba(191,97,106,1)','rgba(217,99,59,1)','rgba(94,161,128,1)','rgba(236,173,50,1)','rgba(255,51,51,1)','rgba(77,182,224,1)','rgba(254,135,134,1)'];

var customFormat = {

}

var formulas = {};

(function(){
    $.each(customColumnFormula, function (columnName) {
        formulas[columnName] = formulaParse(customColumnFormula[columnName][0]);
        chartData[columnName] = [];
    });

    $.each(formulas, function (columnName) {
        $.each(this, function(i){
            if(this.match(/[a-z\u4e00-\u9eff]{1,20}/)){
                customData[this] = [];

            }
        })
    });
})();

function createCustomReport(panel) {
    console.log(customData);
    var outer = $('<div class="table-outer-container"/>');
    var inner = $('<div class="table-inner-container"/>');
    var table = $('<table id="table" class="table table-bordered table-striped table-condensed table-hover">');
    panel.append(outer);
    outer.append(inner);
    inner.append(table);
    var chartContainer = $('<div>');
    panel.append(chartContainer);

    var tRow = $('<tr>'),
        tCell;
    tRow.append($('<th class="fixed-column">').html('科目\\时间'));
    $.each(customDataYear, function(i){
        tRow.append($('<th>').html(this));
    });

    table.append($('<thead>').append(tRow));
    $.each(customColumnFormula, function(columnName){
        tRow = $('<tr>');
        var dataUnit = customColumnFormula[columnName][1];
        tRow.append($('<th class="fixed-column">').html(unit[dataUnit] == undefined ? columnName : columnName + '(' + unit[dataUnit] + ')'));
        if(this[0].match(/[\+\-\*\/\(\)]/) != null) {
            var stack = [];
            var temp = [];
            var formula = formulas[columnName].slice();
            while (formula.length > 0) {
                if(formula[0].match(/[\+\-\*\/]/)) {
                    var operator = formula.shift();

                    var operand1 = stack.shift();
                    var operand2 = stack.shift();
                    var left = [], right = [];
                    if(operand2 == 'temp') {
                        left = temp;
                    } else if(operand2.match(/^[\-\+]?\d+(\.\d+)?/)){
                        left = operand2;
                    } else {
                        left = customData[operand2];
                    }

                    if(operand1 == 'temp') {
                        right = temp;
                    } else if(operand1.match(/^[\-\+]?\d+(\.\d+)?/)){
                        right = operand1;
                    } else {
                        right = customData[operand1];
                    }

                    if(left == undefined || right == undefined) {
                        continue;
                    }

                    var len = 0;
                    if(left instanceof Array && right instanceof Array) {
                        len = Math.min(left.length, right.length);

                        for (var i = 0; i< len; i++) {
                            temp[i] = calcuate(operator, parseFloat(left[i]), parseFloat(right[i]));
                        }
                    } else if(left instanceof Array){
                        len = left.length;

                        for (var i = 0; i< len; i++) {
                            temp[i] = calcuate(operator, parseFloat(left[i]), right);
                        }
                    } else if(right instanceof Array) {
                        len = right.length;

                        for (var i = 0; i< len; i++) {
                            temp[i] = calcuate(operator, left, parseFloat(right[i]));
                        }
                    }

                    stack.unshift('temp');
                } else {
                    stack.unshift(formula.shift());
                }
            }

            $.each(temp, function(i){
                if(i > 10) {
                    return false;
                }

                if(dataUnit == '%') {
                    tCell = $('<td>').html((this * 100).toFixed(2) + '%');
                }else if(dataUnit != '' && unit[dataUnit] != undefined) {
                    tCell = $('<td>').html((this/unit[dataUnit]).toFixed(2));
                } else {
                    tCell = $('<td>').html(this.toFixed(2));
                }

                tRow.append(tCell);
                chartData[columnName].push(this.toFixed(2));
            });
        } else {
            $.each(customData[this[0]], function(i){
                if(i > 10) {
                    return false;
                }

                if(dataUnit == '%') {
                    tCell = $('<td>').html(parseFloat(this).toFixed(2) + '%');
                } else if(dataUnit != '' && unit[dataUnit] != undefined) {
                    tCell = $('<td>').html((parseFloat(this)/unit[dataUnit]).toFixed(2));
                } else {
                    tCell = $('<td>').html(parseFloat(this).toFixed(2));
                }
                tRow.append(tCell);
                chartData[columnName].push(parseFloat(this).toFixed(2));
            });
        }

        table.append(tRow);

        var column = table.find('.fixed-column');
        column.each(function(){
            $(this).css('position', 'absolute');
        });

        table.css('margin-left', $(column[0]).outerWidth());

        var tr = table.find("tr");
        tr.each(function () {
            var columns = $(this).children();

            var column0 = $(columns[0]).children()[0] || columns[0];
            var column1 = columns[1];

            var height0 = (column0).offsetHeight;
            var height1 = column1 ? column1.offsetHeight : 0;

            var height = Math.max(height0, height1);

            columns[0].style.height = height + "px";
            this.style.height = height + "px";

            if (column1) {
                column1.style.height = height + "px";
            }

        });
    });

    createChart(chartContainer);
}

function createChart(container) {
    $.each(chartGroup, function(i) {
        var datasets = [];
        var count = 0;
        $.each(this[column], function(columnName, type){
            var dataset = {
                type : type,
                label : unit[customColumnFormula[columnName][1]] == undefined ? columnName : columnName + '(' + unit[customColumnFormula[columnName][1]] + ')',
                data : chartData[columnName],
                backgroundColor : count < chartColor.length ? chartColor[count] : 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',.7)'
            };
            count++;
            datasets.push(dataset);
        });

        var ct = $('<canvas>');
        container.append(ct);
        renderChart(ct, datasets);
    });
}

function randomColorFactor() {
    return Math.round(Math.random() * 255);
};

function renderChart(container, datasets){
    var chart = new Chart(container, {
        type : 'bar',
        data : {
            labels : customDataYear,
            datasets : datasets,
        },
        options: {
            animation: {
                onComplete: function () {
                    var chartInstance = this.chart;
                    var ctx = chartInstance.ctx;
                    ctx.textAlign = "center";

                    Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        Chart.helpers.each(meta.data.forEach(function (bar, index) {
                            ctx.fillText(dataset.data[index], bar._model.x, bar._model.y - 10);
                        }),this)
                    }),this);
                }
            }
        }
    });

    return chart;
}

function calcuate(operator, operand1, operand2){
    var value = 0
    switch (operator) {
        case '+' : value = operand1 + operand2;
            break;
        case '-' : value = operand1 - operand2;
            break;
        case '*' : value = operand1 * operand2;
            break;
        case '/' : value = operand1 / operand2;
            break;
    }

    return value;
}

function createReport(panel, stkcd, type, callBack) {
    $.getJSON("http://query.yahooapis.com/v1/public/yql", {
        q: 'select * from json where url=\"http://basic.10jqka.com.cn/' + stkcd + '/flash/' + type + '.txt\"',
        format: "json"
    }, function (data) {
        if (data.query.results) {
            var titles = data.query.results.json['title'],
                select = $('<select>'),
                option = {
                    'year': '按年报期',
                    'report': '按报告期',
                    'simple': '按单季度期'
                };
            for (var key in option) {
                $("<option />", {
                    value: key,
                    text: option[key]
                }).appendTo(select);
            }
            panel.append(select);
            $.each(data.query.results.json, function (key) {
                if (key != 'title') {
                    var table = $('<table class="table table-bordered table-striped">'),
                        container = $('<div>'),
                        tRow,
                        tCell;
                    table.attr('id', key);
                    container.addClass('financial-table-container');

                    $.each(this, function (i) {

                        // for every data financial name
                        tRow = $('<tr>');
                        var titleLabel = '';
                        var columName = '';
                        if (titles[i].json && (titles[i].json instanceof Array)) {
                            for (var j = 0; j < titles[i].json.length; j++) {
                                titleLabel += j > 0 && titles[i].json[j] != '' ? ('(' + titles[i].json[j] + ')') : titles[i].json[j];
                            }

                            columName = titles[i].json[0];
                        } else {
                            titleLabel = titles[i];
                            columName = titles[i];
                        }
                        tRow.append($('<th style="width:20%">').html(titleLabel));


                        if(key == 'year') {
                            // assign custom year by year financial repoart
                            if(i == 0 && customDataYear.length <= 1) {
                                $.each(this.json, function(data){
                                    customDataYear.push(this);
                                });
                                // custom data assign
                            } else if(customData.hasOwnProperty(columName) && customDataLoadedColumn.indexOf(columName) == -1) {
                                $.each(this.json, function(i){
                                    customData[columName].push(this);
                                });

                                // avoid duplicate assign value
                                customDataLoadedColumn.push(columName);

                                if(customData.hasOwnProperty('上一年' + columName) && customDataLoadedColumn.indexOf('上一年' + columName) == -1) {
                                    $.each(this.json, function(i){
                                        if(i > 0) {
                                            customData['上一年' + columName].push(this);
                                        }
                                    });

                                    // avoid duplicate assign value
                                    customDataLoadedColumn.push('上一年' + columName);
                                }
                            }
                        }

                        if(key == 'report' && this.json[0].indexOf('12-31') == -1) {
                            if(i == 0 && customDataYear[0] !=  this.json[i]) {
                                customDataYear.unshift(this.json[i]);
                            } else if(customData.hasOwnProperty(columName)){
                                // avoid duplicate assign value
                                if(customData[columName][0] != this.json[0]) {
                                    customData[columName].unshift(this.json[0]);
                                }

                                if(customData.hasOwnProperty('上一年' + columName)) {
                                    if(customData['上一年' + columName][0] != this.json[4]) {
                                        customData['上一年' + columName].unshift(this.json[4]);
                                    }
                                }
                            }
                        }

                        // header append <th> for year data, otherwise <td> for financial data
                        $.each(this.json, function (j) {
                            // only show 10 year for year term
                            if(j>10 && key == 'year') {
                                return false;
                            }else if(j>12){
                                return false;
                            }

                            if (i == 0) {
                                tCell = $('<th>').html(this);
                            } else {
                                tCell = $('<td>').html(this);
                            }
                            tRow.append(tCell);
                        });


                        if (i == 0) {
                            table.append($('<thead>').append(tRow));
                        } else {
                            table.append(tRow);
                        }
                    });

                    container.append(table);
                    panel.append(container);
                }
            });

            select.change(function (e) {
                var select = e.target,
                    tables = panel.find('table');
                $.each(tables, function (i) {
                    $(this).hide();
                    if ($(this).attr('id') == $(select).find("option:selected")[0].value) {
                        $(this).show();
                    }
                })
            });

            select.trigger('change');
        } else {
            panel.text('no data');
        }

        callBack(type);
    });
}
