/**
 * Created by cxh on 2016/5/10.
 */
define(['lexer', 'shunt'], function (Lexer, Parser) {
    var lexer = new Lexer;

    lexer.addRule(/\s+/, function () {
        // skip whitespace
    });

    lexer.addRule(/[\+\-\*\/\(\)]/, function (lexeme) {
        // punctuators: +, -, *, /, (, ).
        return lexeme;
    });

    lexer.addRule(/(\-?(?:0|[1-9]\d*)(?:\.\d+)?)|([a-z\u4e00-\u9eff]{1,20})/, function (lexeme) {
        // matches a number
        // may start with an optional minus sign
        // may have an optional decimal part
        return lexeme;
    });

    var left1 = {
        associativity: "left",
        precedence: 1
    };

    var left2 = {
        associativity: "left",
        precedence: 2
    };

    var parser = new Parser({
        "+": left1,
        "-": left1,
        "*": left2,
        "/": left2
    });

    return {
        formulaParse: function (input) {
            lexer.setInput(input);
            var tokens = [],
                token;
            while (token = lexer.lex()) {
                tokens.push(token);
            }

            return parser.parse(tokens);
        }
    }
});
