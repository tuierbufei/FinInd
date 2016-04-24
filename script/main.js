/**
 * Created by cxh on 2016/4/25.
 */
window.onload = function () {
    var isReload = {
            benefit: true,
            debt: true,
            cash: true,
        },
        activeTab = 'benefit',
        stkcd;

    var callBack = function (type) {
        $('#stkcdSearch').button('reset');

        isReload[type] = true;
    };

    $('#stkcdSearch').on('click', function () {
        var $btn = $(this).button('loading');
        stkcd = $('#stkcd').val();
        $.each(isReload, function (type) {
            isReload[type] = false;
        });

        createReport($('#' + activeTab), stkcd, activeTab, callBack);
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        activeTab = $(e.target).attr('aria-controls');
        if (!isReload[activeTab]) {
            createReport($('#' + activeTab), stkcd, activeTab, callBack);
        }
    });
}