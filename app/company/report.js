/**
 * Created by cxh on 2016/4/25.
 */

define(['jquery', 'company/customReport'], function ($, customReport) {
    return {
        render: function (panel, stkcd, type, callBack, attempt) {
            var self = this;
            $.getJSON("http://query.yahooapis.com/v1/public/yql", {
                q: 'select * from json where url=\"http://basic.10jqka.com.cn/' + stkcd + '/flash/' + type + '.txt\"',
                format: "json"
            }, function (data) {
                if ((data.query.count == 0 || data.query.count == '0') && attempt > 0) {
                    attempt--;
                    self.render(panel, stkcd, type, callBack, attempt);

                    return;
                }
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


                                if (key == 'year') {
                                    if (i == 0 && !customReport.isYearInitialized()) {
                                        customReport.initYear(this.json);
                                    } else if (customReport.containsColumnName(columName) && !customReport.isColumnDataInitialized(columName)) {
                                        customReport.addColumnData(columName, this.json);
                                    }
                                }

                                if (key == 'report' && this.json[0].indexOf('12-31') == -1) {
                                    var years = customReport.getYears();
                                    if (i == 0 && years instanceof Array && years[0] != this.json[i]) {
                                        years.unshift(this.json[i]);
                                    } else if (customReport.containsColumnName(columName)) {
                                        // avoid duplicate assign value
                                        var columnData = customReport.getColumnData(columName);
                                        if (columnData instanceof Array && columnData[0] != this.json[0]) {
                                            columnData.unshift(this.json[0]);
                                        }

                                        if (columnData.hasOwnProperty('上一年' + columName)) {
                                            if (columnData['上一年' + columName][0] != this.json[4]) {
                                                columnData['上一年' + columName].unshift(this.json[4]);
                                            }
                                        }
                                    }
                                }

                                // header append <th> for year data, otherwise <td> for financial data
                                $.each(this.json, function (j) {
                                    // only show 10 year for year term
                                    if (j > 10 && key == 'year') {
                                        return false;
                                    } else if (j > 12) {
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
    }
});
