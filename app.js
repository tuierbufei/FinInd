requirejs.config({
    baseUrl: 'assert/lib',
    paths: {
        app: '../../app',
        company: '../../app/company',
        industry: '../../app/industry',
        common:'../../app/common',
        jquery: 'jquery-1.9.1',
        jqueryActual : 'jquery.actual.min',
        jqueryShow : 'jquery.show',
        highstock: 'highstock',
        chartjs: "Chart.min",
        bootstrap: 'bootstrap.min',
        lexer: 'lexer',
        shunt: 'shunt',
        typeahead: 'typeahead.bundle.min',
        light7: 'light7'
    },
    shim: {
        highstock: {
            exports: "Highcharts",
            deps: ["jquery"]
        },
        chartjs: {
            deps: ['jquery'],
            exports: 'Chart'
        },
        bootstrap: {
            deps: ['jquery']
        },
        lexer: {
            exports: 'Lexer'
        },
        shunt: {
            exports: 'Parser'
        },
        typeahead: {
            deps: ['jquery'],
            exports: 'Bloodhound',
            init: function ($) {
                return require.s.contexts._.registry['typeahead.js'].factory($);
            }
        },
        light7: {
            deps: ['jquery'],
            init: function (jquery) {
                jquery.support.cors = true;
            }
        },
        jqueryActual:{
            deps: ['jquery']
        },
        jqueryShow:{
            deps: ['jquery']
        }
    }
});

// Start loading the main app file.
requirejs(['jquery','domready','app/main'], function($, domready) {
    var customIconNavTab = ['companyNav', 'industryNav'];
    domready(function () {
        var navs = $('#navTab').find('a');
        var activeTab = $('#navTab').find('.active')[0];
        if(activeTab != undefined && customIconNavTab.indexOf(activeTab.id) != -1) {
            var icon = $(activeTab).find('img')[0];
            if(icon != undefined) {
                icon.src = $(icon).attr('data-selected');
            }
        }

        $.each(navs, function(index, tab){
            //navs.find('.active').
            $(tab).on('click', function(e){
                var previous = $(e.currentTarget).parent().find('.active')[0];
                if(previous != undefined && customIconNavTab.indexOf(previous.id) != -1) {
                    var icon = $(previous).find('img')[0];
                    if(icon != undefined) {
                        icon.src = $(icon).attr('data-unselected');
                    }
                }

                if(customIconNavTab.indexOf(e.currentTarget.id) != -1) {
                    var icon = $(e.currentTarget).find('img')[0];
                    if(icon != undefined) {
                        icon.src = $(icon).attr('data-selected');
                    }
                }
            });

            var icon = $(tab).find('img')[0];
            if(icon != undefined && icon.src == '') {
                icon.src = $(icon).attr('data-unselected');
            }
        });
    });
});
