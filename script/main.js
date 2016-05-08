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
        stkcd;

    var callBack = function (type) {
        isReload[type] = true;
        loadCount --;
        if(loadCount == 0) {
            $('#stkcdSearch').button('reset');
            createCustomReport($('#custom'));
        }
    };

    $('#stkcdSearch').on('click', function () {
        var $btn = $(this).button('loading');
        stkcd = $('#stkcd').val();
        loadCount = 0;
        $.each(isReload, function (type) {
            isReload[type] = false;
            if(subReport[type]){
                $.each(subReport[type], function (i) {
                    loadCount++;
                    createReport($('#' + type), stkcd, subReport[type][i], callBack);
                });
            } else {
                loadCount++;
                createReport($('#' + type), stkcd, type, callBack);
            }
        });
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        activeTabName = $(e.target).attr('aria-controls');
        if (!isReload[activeTabName] && activeTabName != 'custom') {
            createReport($('#' + activeTabName), stkcd, activeTabName, callBack);
        }
    });
}