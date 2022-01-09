const evaluate = require("./evaluator.js");
const parse = require("./parser.js");
const topScope = require("./environment.js");

const run = (program) => evaluate(parse(program), Object.create(topScope));

run(`
do(define(total, 0),
   define(count, 1),
   while(<(count, 100),
         do(define(total, +(total, count)),
            define(count, +(count, 1)))),
   print(total))
`);

module.exports = run;
