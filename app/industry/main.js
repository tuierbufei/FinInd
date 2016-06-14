/**
 * Created by ThinkPad on 2016/6/11.
 */
define(['jquery', 'domReady', 'pinyin', 'bloodhound', 'typeahead', , 'json'], function ($, domReady, Pinyin, Bloodhound) {
    var pinyin = new Pinyin;
    var categories = [],
        industries = [],
        companies = [];

    domReady(function () {
        require(['json!data/industry.json'], function (data) {
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
                datumTokenizer: function(datum) {
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
                        var style = ['width:25%;line-height: 1.3rem', 'width:35%', 'width:20%', 'text-align: right; color: rgb(169, 169, 169);float:right'];
                            item += '<span' + ' style=\"' + style[0] + '\">' + suggest.code + '</span>';
                            item += '<span' + ' style=\"' + style[1] + '\">' + suggest.name + '</span>';
                            item += '<span' + ' style=\"' + style[2] + '\">' + suggest.pycode + '</span>';
                            item += '<span' + ' style=\"' + style[3] + '\">' + suggest.industry + '</span>';
                            item += '</div>';
                        return item;
                    }
                }
            });
            
            $('#industrySearchContainer #industrySearch').bind('typeahead:render', function(ev, suggestion) {
                $('#industrySearchContainer .tt-menu').css('width',$('#industrySearchContainer')[0].scrollWidth + 'px');
            });

            $("#industrySearch").on('blur',function(e){
                $("#industry .searchbar-overlay").removeClass("searchbar-overlay-active");
            });

            //加遮罩
            $("#industrySearch").on('focus',function(e){
                $("#industry .searchbar-overlay").addClass("searchbar-overlay-active");
            });

            //禁止遮罩touch
            $("#industry .searchbar-overlay").on("touchstart",function(e){
                e.preventDefault();
            });
        });
    });
});
