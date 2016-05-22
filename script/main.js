/**
 * Created by cxh on 2016/4/25.
 */
window.onload = function () {
    var isReload = {
            main: true,
            benefit: true,
            debt: true,
            cash: true
        },
        subReport = {
            main : ['main','each','grow','pay','operate']
        },
        loadCount,
        activeTabName = 'main',
        stkcd,
        attempt = 3;

    $('#loadding').hide();

    var callBack = function (type) {
        isReload[type] = true;
        loadCount --;
        if(loadCount == 0) {
            $('#stkcdSearch').button('reset');
            $('#custom').empty();
            createCustomReport($('#custom'));
            $('#loadding').hide();
        }
    };


    $('#stkcdInput').typeahead(null, {
            name: 'stkcd',
            limit: 50,
            display: 'value',
            source: function findMatches(q, cb, async) {
                queryByYQL(q, async, attempt);
            },
        templates: {
            empty: [
                '<div class="empty-message">',
                '未找到符合条件的结果',
                '</div>'
            ].join('\n'),
                suggestion: function (suggest) {
                    var item = '<div class="suggetstion-item-container">';
                    var style = ['width:54px;line-height: 22px', 'width:75px', 'width:40px' , 'width:30px; text-align: right; color: rgb(169, 169, 169);'];
                    $.each(suggest.data, function (i) {
                        item += '<span'+ ' style=\"' + style[i] + '\">' + this + '</span>';
                    });
                    item += '</div>';
                    return item;
                }
        }
    });

    function queryByYQL(query, cb, attempt) {
        $.getJSON("http://query.yahooapis.com/v1/public/yql", {
            q: 'select * from html where url=\"http://smartbox.gtimg.cn/s3/?v=2&q=' + $('#stkcdInput').val() + '&t=gp\" and xpath=\"//*/text()\"',
            format: "json"
        }, function (data) {
            if((data.query.count == 0 || data.query.count == '0') && attempt > 0) {
                attempt --;
                queryByYQL(query, cb, attempt);
                return;
            }

            if(data.query.results && data.query.results != 'null') {
                var result = eval(data.query.results);
                if(result != "N" && result.indexOf('GP-A') != -1) {
                    var data = result.split('^'),
                        temp,
                        matches = [];
                    $.each(data, function (i) {
                        if(i > 10) {
                            return false;
                        }
                        temp = this.split('~');
                        var match = { value:temp[1], market : temp[0].toUpperCase()};
                        $.each(temp, function(i){
                            if(temp[i].indexOf(query) != -1) {
                                temp[i] = this.replace(query, '<strong>' + query + '</strong>');
                            }
                        });
                        match.data = [temp[1],temp[2],temp[3].toUpperCase(),temp[0] == 'sh' ? '沪市' : '深市'];
                        matches.push(match);
                    });

                    console.log(matches);
                    cb(matches);
                } else {
                    cb([]);
                }
            } else {
                cb([]);
            }
        });
    }

    $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
        $('#loadding').show();
        $('#custom').empty();
        $('#stockInfo').empty();
        stkcd = suggestion.value;
        createStockInfo($('#stockInfo'), suggestion.market, stkcd, attempt);
        loadCount = 0;
        customDataYear = [];
        customDataLoadedColumn = [];
        $.each(customData, function(columnName){
            customData[columnName] = [];
        });

        $.each(customColumnFormula, function (columnName) {
            chartData[columnName] = [];
        });

        $.each(isReload, function (type) {
            isReload[type] = false;
            $('#' + type).empty();
            if(subReport[type]){
                $.each(subReport[type], function (i) {
                    loadCount++;
                    createReport($('#' + type), stkcd, subReport[type][i], callBack, attempt);
                });
            } else {
                loadCount++;
                createReport($('#' + type), stkcd, type, callBack, attempt);
            }
        });
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        activeTabName = $(e.target).attr('aria-controls');
        if (!isReload[activeTabName] && activeTabName != 'custom') {
            createReport($('#' + activeTabName), stkcd, activeTabName, callBack, attempt);
        }
    });
}