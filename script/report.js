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
    百万:1,
    亿:100,
}

var customColumnFormula = {
    营业收入: ['营业收入', '亿'],
    营业收入增长率 : ['营业总收入同比增长率', '%'],
    毛利率 : ['销售毛利率', '%'],
    三项费用率 : ['(管理费用+销售费用+财务费用)/营业收入', '%'],
    销售费用率 : ['销售费用/营业收入', '%'],
    管理费用率 : ['管理费用/营业收入', '%'],
    财务费用率 : ['财务费用/营业收入', '%'],
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

var customFormat = {

}

var formulas = {};

(function(){
    $.each(customColumnFormula, function (columnName) {
        formulas[columnName] = formulaParse(customColumnFormula[columnName][0]);
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

 //   $(inner).scroll(function (e) {
 //       if(e.target.scrollLeft > 0 && table.css('margin-left') == '0px'){

//        }
//    });

    table.append($('<thead>').append(tRow));
    $.each(customColumnFormula, function(columnName){
        tRow = $('<tr>');
        tRow.append($('<th class="fixed-column">').html(columnName));
        var chartData = [];
        var dataUnit = customColumnFormula[columnName][1];
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
                            if(columnName == '净利润增长率') {
                                console.log(parseFloat(left[i]));
                                console.log(parseFloat(right[i]));
                            }
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
                            temp[i] = calcuate(operator, parseFloat(right[i]), left);
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
                    tCell = $('<td>').html((this/unit[dataUnit]).toFixed(2) + '' + dataUnit);
                } else {
                    tCell = $('<td>').html(this.toFixed(2));
                }

                tRow.append(tCell);
                chartData.push(this.toFixed(2));
            });

            createChart(chartContainer, columnName, customDataYear, chartData);
        } else {
            $.each(customData[this[0]], function(i){
                if(i > 10) {
                    return false;
                }

                if(dataUnit == '%') {
                    tCell = $('<td>').html(parseFloat(this).toFixed(2) + '%');
                } else if(dataUnit != '' && unit[dataUnit] != undefined) {
                    tCell = $('<td>').html((parseFloat(this)/unit[dataUnit]).toFixed(2) + '' + dataUnit);
                } else {
                    tCell = $('<td>').html(parseFloat(this).toFixed(2));
                }
                tRow.append(tCell);
                chartData.push(parseFloat(this).toFixed(2));
            });

            createChart(chartContainer, columnName, customDataYear, chartData);
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

    //table.bootstrapTable({
    //    fixedColumns: true
    //});
}

function createChart(container, columnName, customDataYear, customData) {
    var ct = $('<canvas>');
    container.append(ct);

    var chart = new Chart(ct, {
        type : 'line',
        data : {
            labels : customDataYear,
            datasets : [{
                label : columnName,
                data : customData
            }]
        }
    });

    return ct;
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
