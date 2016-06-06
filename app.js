requirejs.config({
    baseUrl: 'assert/js',
    paths: {
        app: '../app',
        company: '../app/company',
        industry: '../app/industry',
        jquery: 'jquery-1.9.1',
        highstock: 'highstock',
        chartjs: "Chart.min",
        bootstrap: 'bootstrap.min',
        lexer: 'lexer',
        shunt: 'shunt'
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
        }
    }
});

// Start loading the main app file.
requirejs(['app/main']);
