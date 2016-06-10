/**
 * Created by cxh on 2016/4/25.
 */

define(['jquery', 'company/customReport', 'common/horizontalScrollTable', 'domReady'], function ($, customReport, horizontalScrollTable, domReady) {
    var isReportRendered = {
            main: false,
            benefit: false,
            debt: false,
            cash: false
        },
        subReport = {
            main: ['main', 'each', 'grow', 'pay', 'operate']
        },
        loadCount,
        attempt = 3,
        reportData = {};

    var callBack = function (type) {
        loadCount--;
        if (loadCount == 0) {
            customReport.dataLoadCompleted();
        }
        
        if($('#' + type).is(":visible")) {
            render($('#' + type));
        }
    };

    domReady(function (e) {
        var navs = $('#finreprotNavTabLink').find('a');

        $.each(navs, function (index, tab) {
            $(tab).on('click', function (e) {
                var panel = $(e.target.hash);
                setTimeout(function() {
                    render(panel);
                }, 1);
            });
        });
    });

    function render(panel) {
        if(panel == null) {
            var container = $('#finreprotTab .active')[0];
            if (container != undefined) {
                setTimeout(function() {
                    render($(container));
                }, 1);
            }
            
            return;
        }
        
        var id = panel.attr('id');

        if(isReportRendered[id]) {
            return ;
        }

        panel.empty();
        $('#reportLoadding').show();

        if(subReport[id] != undefined) {
            $.each(subReport, function(type) {
                if(reportData[type] != undefined) {
                    renderTable(panel, reportData[type]);
                }
            });
        } else {
            if(reportData[id] != undefined) {
                renderTable(panel, reportData[id]);
            }
        }

        $('#reportLoadding').hide();
        isReportRendered[id] = true;
    }

    function renderTable(panel, data) {
        var titles = data['title'],
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
        $.each(data, function (key) {
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
                    if (titles[i].json && (titles[i].json instanceof Array)) {
                        for (var j = 0; j < titles[i].json.length; j++) {
                            titleLabel += j > 0 && titles[i].json[j] != '' ? ('(' + titles[i].json[j] + ')') : titles[i].json[j];
                        }

                    } else {
                        titleLabel = titles[i];
                    }
                    tRow.append($('<th style="width:20%">').html(titleLabel));


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
                panel.append(container);
                horizontalScrollTable.appendTo(container, table);
                horizontalScrollTable.init(table);
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
    }

    function getData(stkcd, type, callBack, attempt) {
        $.getJSON("http://query.yahooapis.com/v1/public/yql", {
            q: 'select * from json where url=\"http://basic.10jqka.com.cn/' + stkcd + '/flash/' + type + '.txt\"',
            format: "json"
        }, function (data) {
            if ((data.query.count == 0 || data.query.count == '0') && attempt > 0) {
                attempt--;
                getData(stkcd, type, callBack, attempt);

                return;
            }

            if (data.query.results) {
                reportData[type] = data.query.results.json;
                var titles = data.query.results.json['title'];
                $.each(data.query.results.json, function (key) {
                    $.each(this, function (i) {
                        var columName = '';
                        if (titles[i].json && (titles[i].json instanceof Array)) {
                            columName = titles[i].json[0];
                        } else {
                            columName = titles[i];
                        }
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
                    });

                });

                callBack(type);

            } else {
                callBack(type);
            }
        });
    }

    return {
        render: render,
        getAllData: function (stkcd) {
            var container = $('#finreprotTab .active')[0];
            if (container != undefined && $(container).is(":visible")) {
                $('#reportLoadding').show();
                $(container).empty();
            }

            loadCount = 0;
            customReport.resetData();
            $.each(reportData, function(type){
                reportData[type] = [];
            });
            $.each(isReportRendered, function (type) {
                isReportRendered[type] = false;
                if (subReport[type]) {
                    $.each(subReport[type], function (i, subType) {
                        loadCount++;
                        getData(stkcd, subType, callBack, attempt);
                    });
                } else {
                    loadCount++;
                    getData(stkcd, type, callBack, attempt);
                }
            });
        }
    }
});
