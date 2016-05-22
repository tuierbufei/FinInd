/**
 * Created by ThinkPad on 2016/5/22.
 */
function createStockInfo(panel, market, stkcd, attempt) {
    var token = 'b447929763f9d4b4283aeb8913865368b17060fa';
    $.getJSON("http://query.yahooapis.com/v1/public/yql", {
        q: 'select * from json where url=\"http://xueqiu.com/v4/stock/quote.json?code=' + market + stkcd + '&_=' + Date.parse(new Date()) + '&access_token=' + token + '\"',
        format: "json"
    }, function (data) {
        if((data.query.count == 0 || data.query.count == '0') && attempt > 0) {
            attempt --;
            createReport(panel, market, stkcd, attempt);

            return;
        }

        if(data.query.results) {
            if(data.query.results.error_description) {
                panel.append('公司未找到');
            } else {
                var info = data.query.results[market + stkcd];

                // title
                panel.append($('<div>').html(info.name + '[' + market + ':' + stkcd + ']'));

                // stock price
                panel.append($('<span>').html('￥' + info.current));
                var container = $('<span>');
                container.append($('<div>').html(info.change));
                container.append($('<div>').html('(' + info.percentage + ')'));
                panel.append(container);

                //
                var table = $('<table class="table stock-info">');
                var tr = $('<tr>');
                tr.append($('<td>').append('<span>今开</span><br/>' + info.open));
                tr.append($('<td>').append('<span>昨收</span><br/>' + info.last_close));
                tr.append($('<td>').append('<span>振幅</span><br/>' + info.high + ' %'));
                tr.append($('<td>').append('<span>换手率</span><br/>' + info.turnover_rate + ' %'));

                table.append(tr);
                tr = $('<tr>');
                tr.append($('<td>').append('<span>市值</span><br/>' + (parseFloat(info.marketCapital) / 100000000).toFixed(2) + ' 亿'));
                tr.append($('<td style="padding-left: 0px;padding-right: 0px;max-width: 110px">').append('<span>市盈率TTM/TYR</span><br/>' + parseFloat(info.pe_ttm).toFixed(2) + '/' + parseFloat(info.pe_lyr).toFixed(2)));
                tr.append($('<td>').append('<span>市静率</span><br/>' + info.pb));
                tr.append($('<td>').append('<span>市销率</span><br/>' + info.psr));

                table.append(tr);
                tr = $('<tr>');
                tr.append($('<td>').append('<span>成交量（股）</span><br/>' + (parseFloat(info.volume)/10000).toFixed(2) + ' 万') );
                tr.append($('<td>').append('<span>流通股本</span><br/>' + (parseFloat(info.float_shares)/100000000).toFixed(2) + ' 亿'));
                tr.append($('<td>').append('<span>流通市值</span><br/>' + (parseFloat(info.float_market_capital) / 100000000).toFixed(2) + ' 亿'));
                tr.append($('<td>').append('<span>股息收益率</span><br/>' + info.yield + ' %'));

                table.append(tr);

                panel.append(table);
            }
        }
    });
}