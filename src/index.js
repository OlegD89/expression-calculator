function eval() {
    // Do not use eval!!!
    return;
}

"use strict";
class Calculation {
    constructor() {
        this._symbols = {};
        this.defineOperator("!", this.factorial,      "postfix", 6);
        this.defineOperator("^", Math.pow,            "infix",   5, true);
        this.defineOperator("*", this.multiplication, "infix",   4);
        this.defineOperator("/", this.division,       "infix",   4);
        this.defineOperator("+", this.last,           "prefix",  3);
        this.defineOperator("-", this.negation,       "prefix",  3);
        this.defineOperator("+", this.addition,       "infix",   2);
        this.defineOperator("-", this.subtraction,    "infix",   2);
        this.defineOperator(",", Array.of,            "infix",   1);
        this.defineOperator("(", this.last,           "prefix");
        this.defineOperator(")", null,                "postfix");
        this.defineOperator("min", Math.min);
        this.defineOperator("sqrt", Math.sqrt);
    }
    // Method allowing to extend an instance with more operators and functions:
    defineOperator(symbol, f, notation = "func", precedence = 0, rightToLeft = false) {
        // Store operators keyed by their symbol/name. Some symbols may represent
        // different usages: e.g. "-" can be unary or binary, so they are also
        // keyed by their notation (prefix, infix, postfix, func):
        if (notation === "func") precedence = 0;
        this._symbols[symbol] = Object.assign({}, this._symbols[symbol], {
            [notation]: {
                symbol, f, notation, precedence, rightToLeft, 
                argCount: 1 + (notation === "infix")
            },
            symbol,
            regSymbol: symbol.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
                + (/\w$/.test(symbol) ? "\\b" : "") // add a break if it's a name 
        });
    }
    last(...a)           { return a[a.length-1] }
    negation(a)          { return -a }
    addition(a, b)       { return a + b }
    subtraction(a, b)    { return a - b }
    multiplication(a, b) { return a * b }
    division(a, b)       {  
        if(b==0)
            throw "TypeError: Division by zero.";
        return a / b }
    factorial(a) {
        if (a%1 || !(+a>=0)) return NaN
        if (a > 170) return Infinity;
        let b = 1;
        while (a > 1) b *= a--;
        return b;
    }
    calculate(expression) {
        let match;
        const values = [],
            operators = [this._symbols["("].prefix],
            exec = _ => {
                let op = operators.pop();
                values.push(op.f(...[].concat(...values.splice(-op.argCount))));
                return op.precedence;
            },
            error = msg => {
                let notation = match ? match.index : expression.length;
                return `${msg} at ${notation}:\n${expression}\n${' '.repeat(notation)}^`;
            },
            pattern = new RegExp(
                // Pattern for numbers
                "\\d+(?:\\.\\d+)?|" 
                // ...and patterns for individual operators/function names
                + Object.values(this._symbols)
                        // longer symbols should be listed first
                        .sort( (a, b) => b.symbol.length - a.symbol.length ) 
                        .map( val => val.regSymbol ).join('|')
                + "|(\\S)", "g"
            );
        let afterValue = false;
        pattern.lastIndex = 0; // Reset regular expression object
        do {
            match = pattern.exec(expression);
            const [token, bad] = match || [")", undefined],
                notNumber = this._symbols[token],
                notNewValue = notNumber && !notNumber.prefix && !notNumber.func,
                notAfterValue = !notNumber || !notNumber.postfix && !notNumber.infix;
            // Check for syntax errors:
            if (bad || (afterValue ? notAfterValue : notNewValue)) return error("Syntax error");
            if (afterValue) {
                // We either have an infix or postfix operator (they should be mutually exclusive)
                const curr = notNumber.postfix || notNumber.infix;
                do {
                    const prev = operators[operators.length-1];
                    if (((curr.precedence - prev.precedence) || prev.rightToLeft) > 0) break; 
                    // Apply previous operator, since it has precedence over current one
                } while (exec()); // Exit loop after executing an opening parenthesis or function
                afterValue = curr.notation === "postfix";
                if (curr.symbol !== ")") {
                    operators.push(curr);
                    // Postfix always has precedence over any operator that follows after it
                    if (afterValue) exec();
                }
            } else if (notNumber) { // prefix operator or function
                operators.push(notNumber.prefix || notNumber.func);
                if (notNumber.func) { // Require an opening parenthesis
                    match = pattern.exec(expression);
                    if (!match || match[0] !== "(") return error("Function needs parentheses")
                }
            } else { // number
                values.push(+token);
                afterValue = true;
            }
        } while (match && operators.length);

        return operators.length ? error("Missing closing parenthesis")
                : match ? error("Too many closing parentheses")
                : values.pop() // All done!
    }
}




Calculation = new Calculation(); // Create a singleton

// const expr = "((1 + 2) * 3";
// const expr = "2 + 2";
// const expr = "1/2";
// var test = expressionCalculator(expr);
// // var tset = Number(expressionCalculator(expr));
// var t =2;

function expressionCalculator(expr) {
    // write your solution here
    //expr = expr.replace(/\s/g, '');
    //return Number(calculate(expr));

    var start = expr.match(/\(/g);
    var end = expr.match(/\)/g);
    if((start && !end) || (!start && end) || (start && end && start.length!=end.length)){
        throw "ExpressionError: Brackets must be paired";
    }

    var exprRep = expr.replace(/\s/g, '');
    var test = Calculation.calculate(exprRep);
    return test;

}

module.exports = {
    expressionCalculator
}

function calculate(str) {
    var was_str;
    var sum_or_diff=function(sub, a, sign, b) {
     return sign=="-" ? a-b : +a + +b;
    };
    var mult_or_div= function(sub, a, sign, b) {
     if(sign=="*"){
        return a*b;
     }else{
        if(b==0)
            throw "TypeError: Division by zero.";
        return a/b;
     }
    };
    var power= function(sub, a, b) {
     return Math.pow(a, b);
    };
    var match_power= /(-?[\d\.]+)\s*\^\s*(-?[\d\.]+)/g;
    var match_mult_div= /(-?[\d\.]+)\s*([\*\/])\s*(-?[\d\.]+)/g;
    var match_sum_diff= /(-?[\d\.]+)\s*([\+-])\s*(-?[\d\.]+)/g;
    
    var get_value= function(sub, exp) {
     while(exp.indexOf("^")!==-1)
      exp= exp.replace(match_power, power);
     while(match_mult_div.test(exp))
      exp= exp.replace(match_mult_div, mult_or_div);
     while(match_sum_diff.test(exp))
      exp= exp.replace(match_sum_diff, sum_or_diff);
     return exp;
    };
    while(str.indexOf("(") !== -1) // убираем скобки
     str=str.replace(/\(([^\(\)]*)\)/g, get_value);
    
    var res = get_value("", str);
    return res;
    };