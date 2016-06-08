/**
 * Created by cxh on 2016/5/20.
 */
// cunstom column name and formula to calcuate from custom data.

define(['jquery', 'company/parser', 'company/chart'], function ($, parser, chart) {
    var unit = {
        万: 0.01,
        百万: 100,
        亿: 10000,
    }

    var formulas = {};

    // for custom column year
    var customDataYear = [];
    // for custom column data extract from financial report
    var customData = {};
    // avoid duplicate load data
    var customDataLoadedColumn = [];

    var customColumnFormula = {
        营业收入: ['营业收入', '亿'],
        营业收入增长率: ['营业总收入同比增长率', '%'],
        毛利率: ['销售毛利率', '%'],
        三项费用率: ['(管理费用+销售费用+财务费用)/营业收入', '%'],
        销售费用率: ['销售费用/营业收入', '%'],
        管理费用率: ['管理费用/营业收入', '%'],
        财务费用率: ['财务费用/营业收入', '%'],
        扣非净利润: ['扣非净利润', '亿'],
        扣非净利润率: ['扣非净利润/营业收入', '%'],
        净利润增长率: ['(净利润-上一年净利润)/上一年净利润', '%'],
        资产负债率: ['资产负债比率', '%'],
        流动比率: ['流动比率', ''],
        速动比率: ['速动比率', ''],
        存货周转率: ['存货周转率', ''],
        应收账款周转率: ['360/应收账款周转天数', ''],
        固定资产比重: ['固定资产/资产总计', '%'],
        净资产收益率ROE: ['净资产收益率', '%'],
        总资产收益率: ['净利润/资产总计', '%'],
        经营性现金流净额比净利润: ['经营现金流量净额/净利润', '']
    };

    (function () {
        $.each(customColumnFormula, function (columnName) {
            formulas[columnName] = parser.formulaParse(customColumnFormula[columnName][0]);
        });

        $.each(formulas, function (columnName) {
            $.each(this, function (i) {
                if (this.match(/[a-z\u4e00-\u9eff]{1,20}/)) {
                    customData[this] = [];

                }
            })
        });
    })();

    function calcuate(operator, operand1, operand2) {
        var value = 0
        switch (operator) {
            case '+':
                value = operand1 + operand2;
                break;
            case '-':
                value = operand1 - operand2;
                break;
            case '*':
                value = operand1 * operand2;
                break;
            case '/':
                value = operand1 / operand2;
                break;
        }

        return value;
    }

    return {
        getYears: function () {
            return customDataYear;
        },
        data: function () {
            return customData;
        },
        getColumnData: function (columnName) {
            return customData[columnName];
        },
        getColumnName : function() {
            return customColumnFormulaName;
        },
        getloadedColumn: function () {
            return customDataLoadedColumn;
        },
        getFormula: function () {
            return customColumnFormula;
        },
        render: function (panel) {
            var outer = $('<div class="table-outer-container"/>');
            var inner = $('<div class="table-inner-container"/>');
            var table = $('<table id="table" class="table table-bordered table-striped table-condensed">');
            var chartContainer = $('<div>');
            panel.append(chartContainer);

            panel.append(outer);
            outer.append(inner);
            inner.append(table);

            var tRow = $('<tr>'),
                tCell;
            tRow.append($('<th class="fixed-column">').html('科目\\时间'));
            $.each(customDataYear, function (i) {
                tRow.append($('<th>').html(this));
            });

            table.append($('<thead>').append(tRow));
            $.each(customColumnFormula, function (columnName) {
                tRow = $('<tr>');
                var dataUnit = customColumnFormula[columnName][1];
                tRow.append($('<th class="fixed-column">').html(unit[dataUnit] == undefined ? columnName : columnName + '(' + dataUnit + ')'));
                if (this[0].match(/[\+\-\*\/\(\)]/) != null) {
                    var stack = [];
                    var temp = [];
                    var formula = formulas[columnName].slice();
                    while (formula.length > 0) {
                        if (formula[0].match(/[\+\-\*\/]/)) {
                            var operator = formula.shift();

                            var operand1 = stack.shift();
                            var operand2 = stack.shift();
                            var left = [],
                                right = [];
                            if (operand2 == 'temp') {
                                left = temp;
                            } else if (operand2.match(/^[\-\+]?\d+(\.\d+)?/)) {
                                left = operand2;
                            } else {
                                left = customData[operand2];
                            }

                            if (operand1 == 'temp') {
                                right = temp;
                            } else if (operand1.match(/^[\-\+]?\d+(\.\d+)?/)) {
                                right = operand1;
                            } else {
                                right = customData[operand1];
                            }

                            if (left == undefined || right == undefined) {
                                continue;
                            }

                            var len = 0;
                            if (left instanceof Array && right instanceof Array) {
                                len = Math.min(left.length, right.length);

                                for (var i = 0; i < len; i++) {
                                    temp[i] = calcuate(operator, parseFloat(left[i]), parseFloat(right[i]));
                                }
                            } else if (left instanceof Array) {
                                len = left.length;

                                for (var i = 0; i < len; i++) {
                                    temp[i] = calcuate(operator, parseFloat(left[i]), right);
                                }
                            } else if (right instanceof Array) {
                                len = right.length;

                                for (var i = 0; i < len; i++) {
                                    temp[i] = calcuate(operator, left, parseFloat(right[i]));
                                }
                            }

                            stack.unshift('temp');
                        } else {
                            stack.unshift(formula.shift());
                        }
                    }

                    $.each(temp, function (i) {
                        if (i > 10) {
                            return false;
                        }

                        var cellData = 0;
                        if (dataUnit == '%') {
                            cellData = (this * 100).toFixed(2);
                        } else if (dataUnit != '' && unit[dataUnit] != undefined) {
                            cellData = (this / unit[dataUnit]).toFixed(2);
                        } else {
                            cellData = this.toFixed(2);
                        }

                        tRow.append($('<td>').html(dataUnit == '%' ? cellData + "%" : cellData));
                        chart.addColumnData(columnName, parseFloat(cellData));
                    });
                } else {
                    $.each(customData[this[0]], function (i) {
                        if (i > 10) {
                            return false;
                        }

                        var cellData = 0;

                        if (dataUnit == '%') {
                            cellData = parseFloat(this).toFixed(2);
                        } else if (dataUnit != '' && unit[dataUnit] != undefined) {
                            cellData = (parseFloat(this) / unit[dataUnit]).toFixed(2);
                        } else {
                            cellData = parseFloat(this).toFixed(2);
                        }
                        tRow.append($('<td>').html(dataUnit == '%' ? cellData + "%" : cellData));
                        chart.addColumnData(columnName, parseFloat(cellData));
                    });
                }

                table.append(tRow);

                var column = table.find('.fixed-column');
                column.each(function () {
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

            chart.render(chartContainer, customColumnFormula, customDataYear);
        },
        initYear: function (years) {
            // assign custom year by year financial repoart
            $.each(years, function (count) {
                if (count > 9) {
                    return false;
                }
                customDataYear.push(this);
            });

        },
        isYearInitialized: function () {
            return customDataYear.length > 1;
        },
        isColumnDataInitialized: function (columnName) {
            return customDataLoadedColumn.indexOf(columnName) != -1;
        },
        addColumnData: function (columName, data) {
            // custom data assign
            $.each(data, function (i) {
                customData[columName].push(this);
            });

            // avoid duplicate assign value
            customDataLoadedColumn.push(columName);

            if (customData.hasOwnProperty('上一年' + columName) && customDataLoadedColumn.indexOf('上一年' + columName) == -1) {
                $.each(data, function (i) {
                    if (i > 0) {
                        customData['上一年' + columName].push(this);
                    }
                });

                // avoid duplicate assign value
                customDataLoadedColumn.push('上一年' + columName);
            }
        },
        containsColumnName: function (columnName) {
            return customData.hasOwnProperty(columnName);
        },
        resetData: function () {
            customDataYear = [];
            customDataLoadedColumn = [];
            $.each(customData, function (columnName) {
                customData[columnName] = [];
            });
        }
    };
});
