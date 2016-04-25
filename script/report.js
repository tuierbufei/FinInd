/**
 * Created by cxh on 2016/4/25.
 */

function createReport(panel, stkcd, type, callBack) {
    panel.empty();
    $.getJSON("http://query.yahooapis.com/v1/public/yql", {
        q: 'select * from json where url=\"http://basic.10jqka.com.cn/'+ stkcd +'/flash/' + type + '.txt\"',
        format: "json"
    }, function (data) {
        if (data.query.results) {
            var titles = data.query.results.json['title'],
                select = $('<select>'),
                option = {'year': '按年报期', 'report': '按报告期', 'simple': '按单季度期'};
            for(var key in option) {
                $("<option />", {value: key, text: option[key]}).appendTo(select);
            }
            panel.append(select);
            $.each(data.query.results.json, function(key) {
                if(key != 'title') {
                    var table = $('<table>'),
                        container = $('<div>'),
                        tRow,
                        tCell;
                    table.attr('id', key);
                    container.addClass('fincial-table-container');

                    $.each(this, function(i){
                        tRow = $('<tr>');
                        var titleLabel = '';
                        if(titles[i].json && (titles[i].json instanceof Array)) {
                            for(var j = 0; j< titles[i].json.length; j++) {
                                titleLabel += j>0 && titles[i].json[j] != '' ? ('(' + titles[i].json[j] +')') :titles[i].json[j];
                            }
                        } else {
                            titleLabel = titles[i];
                        }
                        tRow.append($('<td>').html(titleLabel));
                        $.each(this.json, function(j){
                            tCell = $('<td>').html(this);
                            tRow.append(tCell)
                        });
                        table.append(tRow);
                    });

                    container.append(table);
                    panel.append(container);
                }
            });

            select.change(function(e){
                var select = e.target, tables = panel.find('table');
                $.each(tables, function(i){
                    $(this).hide();
                    if($(this).attr('id') == $(select).find("option:selected")[0].value) {
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
