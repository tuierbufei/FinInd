/**
 * Created by ThinkPad on 2016/6/11.
 */
define(['jquery', 'domReady', 'pinyin', 'bloodhound', 'industry/companyselect', 'typeahead', 'json', 'textfill', 'select'], function ($, domReady, Pinyin, Bloodhound, companyselect) {
    var pinyin = new Pinyin;
    var industryMap = [],
        categories = [],
        industries = [],
        companies = [],
        currentCategory,
        currentIndustry,
        defaultIndustryOptionValue = '请选择行业',
        defaultCategoryOptionValue = '请选择行业分类',
        checkedCompanies = [];

    function initIndustrySearchBox() {
        require(['json!data/industry.json'], function (data) {
            industryMap = data;
            $.each(data, function (index, item) {
                categories.push({
                    category: item.category
                });
                $.each(item.industries, function (industryIndex, industryItem) {
                    var industry = {
                        category: item.category,
                        industry: industryItem.name
                    };
                    industries.push(industry);
                    $.each(this.companies, function () {
                        var company = {
                            category: item.category,
                            industry: industryItem.name,
                            name: this.name,
                            code: this.code,
                            pycode: pinyin.getCamelChars(this.name)
                        };
                        companies.push(company);
                    });
                });
            });

            updateSelectOption($('#categorySelect'), categories, 'category', defaultCategoryOptionValue);

            var categoriesEngine = new Bloodhound({
                datumTokenizer: function (datum) {
                    var tokens = [];
                    var stringSize = datum.category.length;
                    for (var size = 1; size <= stringSize; size++) {
                        for (var i = 0; i + size <= stringSize; i++) {
                            tokens.push(datum.category.substr(i, size));
                        }
                    }

                    return tokens;
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: categories
            });

            var industriesEngine = new Bloodhound({
                datumTokenizer: function (datum) {
                    var tokens = [];
                    var stringSize = datum.industry.length;
                    for (var size = 1; size <= stringSize; size++) {
                        for (var i = 0; i + size <= stringSize; i++) {
                            tokens.push(datum.industry.substr(i, size));
                        }
                    }

                    return tokens;
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: industries
            });

            var companiesEngine = new Bloodhound({
                datumTokenizer: function (datum) {
                    var tokens = [];
                    var stringSize = datum.name.length;
                    for (var size = 1; size <= stringSize; size++) {
                        for (var i = 0; i + size <= stringSize; i++) {
                            tokens.push(datum.name.substr(i, size));
                        }
                    }

                    var stringSize = datum.code.length;
                    for (var size = 1; size <= stringSize; size++) {
                        for (var i = 0; i + size <= stringSize; i++) {
                            tokens.push(datum.code.substr(i, size));
                        }
                    }

                    var stringSize = datum.pycode.length;
                    for (var size = 1; size <= stringSize; size++) {
                        for (var i = 0; i + size <= stringSize; i++) {
                            tokens.push(datum.pycode.substr(i, size));
                        }
                    }

                    return tokens;
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: companies
            });

            $('#industrySearch').typeahead({
                highlight: true
            }, {
                name: 'category',
                limit: 5,
                display: 'category',
                source: categoriesEngine,
                templates: {
                    header: '<div class="suggest-dataset-split"></div><div class="typeaherad-templates-header">行业分类</div>'
                }
            }, {
                name: 'industry',
                limit: 5,
                display: 'industry',
                source: industriesEngine,
                templates: {
                    header: '<div class="suggest-dataset-split"></div><div class="typeaherad-templates-header">行业</div>'
                }
            }, {
                name: 'ccompany',
                limit: 5,
                display: 'name',
                source: companiesEngine,
                templates: {
                    header: '<div class="suggest-dataset-split"></div><div class="typeaherad-templates-header">股票</div>',
                    suggestion: function (suggest) {
                        //var item = '<div >';
                        var item = '<div class="suggetstion-item-container">';
                        var style = ['width:20%;line-height: 1.3rem', 'width:25%', 'width:15%', 'text-align: right;word-break:keep-all;white-space:nowrap;'];
                        item += '<span' + ' style=\"' + style[0] + '\">' + suggest.code + '</span>';
                        item += '<span' + ' style=\"' + style[1] + '\">' + suggest.name + '</span>';
                        item += '<span' + ' style=\"' + style[2] + '\">' + suggest.pycode + '</span>';
                        item += '<span' + ' class=\"' + 'industry-category' + '\"' + ' style=\"' + style[3] + '\">' + '<span style=\"float:right\">' + suggest.industry + '</span>' + '</span>';
                        item += '</div>';
                        return item;
                    }
                }
            });

            $('#industrySearch').bind('typeahead:render', function (ev, suggestion) {
                $('#industrySearchContainer .tt-menu').css('width', $('#industrySearchContainer')[0].clientWidth + 'px');
                var industryLabel = $('.industry-category');
                $.each(industryLabel, function () {
                    $(this).css('width', $('#industrySearchContainer')[0].clientWidth * 0.35 + 'px');
                    $(this).textfill({
                        maxFontPixels: 24,
                        widthOnly: true
                    });
                });
            });

            $('#industrySearch').bind('typeahead:select', function (ev, suggestion) {
                categorySelect.data('selectObj').selectedValue(suggestion.category);

                if (suggestion.industry != undefined) {
                    industrySelect.data('selectObj').selectedValue(suggestion.industry);
                }

                $('#industrySearchContainer, #industrySearch').val('');
            });

            $("#industrySearch").on('blur', function (e) {
                $("#industry .searchbar-overlay").removeClass("searchbar-overlay-active");
            });

            //加遮罩
            $("#industrySearch").on('focus', function (e) {
                $("#industry .searchbar-overlay").addClass("searchbar-overlay-active");
            });

            //禁止遮罩touch
            $("#industry .searchbar-overlay").on("touchstart", function (e) {
                e.preventDefault();
            });
        });
    }

    function initSelect(container, select, defaultValue) {
        select.append('<option value="' + defaultValue + '">' + defaultValue + '</option>');
        select.select(container);
    }

    function initSelectOption(select, data, property) {
        $.each(data, function () {
            select.append('<option value="' + this[property] + '">' + this[property] + '</option>');
        });
    }

    function updateSelectOption(select, data, property, defaultOptionValue) {
        select.find('option').remove().end().append('<option value="' + defaultOptionValue + '">' + defaultOptionValue + '</option>').val(defaultOptionValue);
        initSelectOption(select, data, property);
        select.val(defaultIndustryOptionValue).prop('selected', true);
        select.data('selectObj').updateOption();
    }

    function initIndustryDropDownSelect() {
        var container = $('#industrySelectContainer');
        var categorySelect = $('#categorySelect');
        var industrySelect = $('#industrySelect');

        initSelect(container, categorySelect, defaultCategoryOptionValue);
        initSelect(container, industrySelect, defaultIndustryOptionValue);

        categorySelect.on('change', function () {
            var select = this;
            var data = [];
            if ($(select).val() != defaultCategoryOptionValue) {
                $.each(industryMap, function (i, item) {
                    if(item.category == $(select).val()) {
                        data = item.industries;
                        return false;
                    }
                });
            }
            
            updateSelectOption(industrySelect, data, 'name', defaultIndustryOptionValue);
            industrySelect.parent().trigger('click'); // show the popup
        });

        industrySelect.on('change', function () {
            var data = [];
            if ($(industrySelect).val() != defaultIndustryOptionValue) {
                $.each(industryMap, function () {
                    if (this.category == categorySelect.val()) {
                        $.each(this.industries, function () {
                            if (this.name == industrySelect.val()) {
                                data = this.companies;
                                return false;
                            }
                        });

                        return false;
                    }
                })
            }

            initCompaniesSelection(data, industrySelect.val());
        });
    }

    function initCompaniesSelection(companies, industryName) {
        var selectCompanies = [];
        checkedCompanies = [];
        companyselect.setCompanies(companies);
        // default only show 10 companies;
        $.each(companies, function(i) {
            if(i >= 10) {
                return false;
            }

            selectCompanies.push(companies[i]);
            checkedCompanies.push(this.code);
        });

        companyselect.setSelectedCompanies(selectCompanies);
        companyselect.setIndustryName(industryName);
        renderCompanyPanel($('#industryCompany'), selectCompanies, companies.length);
    }

    function renderCompanyPanel(container, selectCompanies, totalCount) {
        container.empty();

        for (var i = 0; i < checkedCompanies.length; i++) {
            if(selectCompanies.map(function(e) {return e.code}).indexOf(checkedCompanies[i]) == -1) {
                checkedCompanies.splice(i, 1);
                i--
            }
        }

        $.each(selectCompanies, function(i) {
            var company = $('<input type="checkbox" id="' + this.code + '" class="industry-company-item">').val(this.name);
            var item = this;
            company.on('change', function () {
                if(this.checked) {
                    if(checkedCompanies.length < 10) {
                        checkedCompanies.push(item.code);
                    } else {
                        this.checked = false;
                        $.alert('最多只能选择10家公司');
                    }

                } else {
                    var index = checkedCompanies.indexOf(item.code);
                    if(index > -1) {
                        checkedCompanies.splice(index, 1);
                    }
                }
            });

            if(checkedCompanies.indexOf(this.code) != -1) {
                company[0].checked = true;
            }

            container.append(company);
            container.append($('<label class="industry-company-item-label" for="' + this.code + '"></label>').html(this.name));
        });

        if(totalCount > 10) {
            var addmore = $('<a class="company-add-link">').html('添加该行业更多公司');
            addmore.on('click', function () {
                $.router.loadPage('./app/industry/company-select.html');
            });

            container.append(addmore);
        }
    }

    domReady(function () {

        initIndustrySearchBox();

        initIndustryDropDownSelect();

        companyselect.onConfirm(function() {
            renderCompanyPanel($('#industryCompany'), companyselect.getSelectedCompanies(),companyselect.getCompanies().length);
        });
    });
});
