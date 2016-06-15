requirejs.config({
    baseUrl: 'assert/lib',
    paths: {
        app: '../../app',
        company: '../../app/company',
        industry: '../../app/industry',
        data: '../../data',
        common:'../../app/common',
        jquery: 'jquery-1.9.1',
        jqueryActual : 'jquery.actual.min',
        jqueryShow : 'jquery.show',
        highstock: 'highstock',
        chartjs: "Chart.min",
        bootstrap: 'bootstrap.min',
        lexer: 'lexer',
        shunt: 'shunt',
        typeahead: 'typeahead.jquery.min',
        bloodhound:'bloodhound.min',
        light7: 'light7',
        pinyin:'pinyin',
        textfill:'jquery.textfill.min',
        select:'jquery.select'
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
            init: function ($) {
                return require.s.contexts._.registry['typeahead.js'].factory($);
            }
        },
        bloodhound: {
            deps: ['jquery'],
            exports: 'Bloodhound',
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
        },
        pinyin:{
            exports: 'Pinyin'
        },
        textfill:{
            deps: ['jquery']
        },
        select:{
            deps:['jquery']
        }
    }
});

requirejs(['app/main']);
