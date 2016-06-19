/**
 * Created by cxh on 2016/6/18.
 */
define(['jquery'], function ($) {
    var companies = [],
        selectedCompanies = [],
        onConfirmCallback,
        industryName;
    $(document).on("pageInit", "#industryCompanySelect", function(e, id, $page) {
        var container = $('#companyListContainer');
        $.each(companies, function(){
            var item = $('<li>');
            var itemContent = $('<label class="label-checkbox item-content">');
            item.append(itemContent);

            var checkbox = $('<input type="checkbox">');
            itemContent.append(checkbox);
            itemContent.append($('<div class="item-media"><i class="icon icon-form-checkbox"></i></div>'));
            if(selectedCompanies.map(function(e) { return e.code; }).indexOf(this.code) != -1) {
                checkbox[0].checked = true;
            }
            var itemConterInner = $('<div class="item-inner">');
            var title = $('<div class="item-title-row">');
            title.append($('<div class="item-title">').html(this.name));
            title.append($('<div class="item-after" style="font-weight:normal">').html(this.code));
            itemConterInner.append(title);
            itemContent.append(itemConterInner);
            container.append(item);

            $('#industryCompanySelect #industryName').html(industryName);
        });

        $('#selectCompanyConfirm').on('click', function() {
            var checkbox = $('#companyListContainer input[type=checkbox]');
            selectedCompanies = [];
            $.each(checkbox, function(i) {
                if(this.checked) {
                    selectedCompanies.push(companies[i]);
                }
            });

            onConfirmCallback(selectedCompanies);
        });
    });

    return {
        setIndustryName: function (name) {
            industryName = name;
        },
        setCompanies: function(data) {
            companies = data;
        },
        getCompanies: function () {
            return companies;
        },
        getSelectedCompanies : function() {
            return selectedCompanies;
        },
        setSelectedCompanies : function(data) {
            selectedCompanies = data;
        },
        onConfirm: function(callback) {
            onConfirmCallback = callback;
        }
    }
});