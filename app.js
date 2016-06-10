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

requirejs(['app/main']);
