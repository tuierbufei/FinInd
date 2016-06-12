/**
 * Created by ThinkPad on 2016/6/11.
 */
define(['jquery', 'domReady', 'pinyin', 'bloodhound', 'typeahead', , 'json'], function ($, domReady, Pinyin, Bloodhound) {
    var pinyin = new Pinyin;
    var categories = [], industries = [], companies = [];

    domReady(function () {
        require(['json!data/industry.json'], function (data) {
            $.each(data, function (index, item) {
                categories.push({category: item.category});
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
                    return Bloodhound.tokenizers.obj.nonword('category');
                },
                queryTokenizer: Bloodhound.tokenizers.nonword,
                // `states` is an array of state names defined in "The Basics"
                local: categories
            });

            var industriesEngine = new Bloodhound({
                datumTokenizer: function (datum) {
                    return Bloodhound.tokenizers.obj.nonword('industry');
                },
                queryTokenizer: Bloodhound.tokenizers.nonword,
                // `states` is an array of state names defined in "The Basics"
                local: industries
            });

            var companiesEngine = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.nonword('name', 'code', 'pycode'),
                queryTokenizer: Bloodhound.tokenizers.nonword,
                // `states` is an array of state names defined in "The Basics"
                local: companies
            });

            $('#industrySearch').typeahead({highlight: true}, {
                name: 'category',
                limit: 5,
                display: 'category',
                source: categoriesEngine,
                templates: {
                    header: '<h3 class="league-name">行业分类</h3>'
                    //suggestion: function (suggest) {
                    //    var item = '<div class="suggetstion-item-container">';
                    //    var style = ['width:54px;line-height: 22px', 'width:75px', 'width:40px', 'width:30px; text-align: right; color: rgb(169, 169, 169);'];
                    //    $.each(suggest.data, function (i) {
                    //        item += '<span' + ' style=\"' + style[i] + '\">' + this + '</span>';
                    //    });
                    //    item += '</div>';
                    //    return item;
                    //}
                }
            }, {
                name: 'industry',
                limit: 5,
                display: 'industry',
                source: industriesEngine,
                templates: {
                    header: '<h3 class="league-name">行业</h3>'
                    //suggestion: function (suggest) {
                    //    var item = '<div class="suggetstion-item-container">';
                    //    var style = ['width:54px;line-height: 22px', 'width:75px', 'width:40px', 'width:30px; text-align: right; color: rgb(169, 169, 169);'];
                    //    $.each(suggest.data, function (i) {
                    //        item += '<span' + ' style=\"' + style[i] + '\">' + this + '</span>';
                    //    });
                    //    item += '</div>';
                    //    return item;
                    //}
                }
            }, {
                name: 'ccompany',
                limit: 5,
                display: 'name',
                source: companiesEngine,
                templates: {
                    header: '<h3 class="league-name">股票</h3>'
                    //suggestion: function (suggest) {
                    //    var item = '<div class="suggetstion-item-container">';
                    //    var style = ['width:54px;line-height: 22px', 'width:75px', 'width:40px', 'width:30px; text-align: right; color: rgb(169, 169, 169);'];
                    //    $.each(suggest.data, function (i) {
                    //        item += '<span' + ' style=\"' + style[i] + '\">' + this + '</span>';
                    //    });
                    //    item += '</div>';
                    //    return item;
                    //}
                }
            });
        });


    });
});