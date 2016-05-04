/**
 * Created by cxh on 2016/4/25.
 */
var customData = ['营业收入','营业收入增长率','毛利率','管理费用', '销售费用', '财务费用','扣非净利润', '资产负债比率', '流动比率', '速动比率', '存货周转率', '应收账款周转率', '固定资产','资产总计','净资产收益率', '经营现金流量净额', '净利率'];
var customData = {};
var customColumn = ['营业收入',
    '营业收入增长率',
    '毛利率',
    '三项费用率',
    '销售费用率',
    '管理费用率',
    '财务费用率',
    '扣非净利润率',
    '净利润增长率',
    '资产负债率',
    '流动比率',
    '速动比率',
    '存货周转率',
    '应收账款周转率',
    '固定资产比重',
    '净资产收益率ROE',
    '总资产收益率',
    '经营性现金流净额/净利润'];
function createReport(panel, stkcd, type, callBack) {
    panel.empty();
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
                    var table = $('<table class="table table-bordered">'),
                        container = $('<div>'),
                        tRow,
                        tCell;
                    table.attr('id', key);
                    container.addClass('fincial-table-container');

                    $.each(this, function (i) {
                        tRow = $('<tr>');
                        var titleLabel = '';
                        if (titles[i].json && (titles[i].json instanceof Array)) {
                            for (var j = 0; j < titles[i].json.length; j++) {
                                titleLabel += j > 0 && titles[i].json[j] != '' ? ('(' + titles[i].json[j] + ')') : titles[i].json[j];
                            }
                        } else {
                            titleLabel = titles[i];
                        }
                        tRow.append($('<th style="width:20%">').html(titleLabel));
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
