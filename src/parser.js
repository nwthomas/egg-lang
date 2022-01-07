// The root parsing function for Egglang
function parse(program) {
  const { expr, rest } = parseExpression(program);

  if (skipSpace(rest).length > 0) {
    throw new SyntaxError("Unexpected text after program");
  }

  return expr;
}

// Allows the parsing of a given expression in Egglang
function parseExpression(newProgram) {
  const normalizedProgram = skipSpace(newProgram);
  let match, expr;

  if ((match = /^"([^"]*)"/.exec(normalizedProgram))) {
    expr = { type: "value", value: match[1] };
  } else if ((match = /^\d+\b/.exec(normalizedProgram))) {
    expr = { type: "value", value: Number(match[0]) };
  } else if ((match = /^[^\s(),#"]+/.exec(normalizedProgram))) {
    expr = { type: "word", name: match[0] };
  } else {
    throw new SyntaxError("Unexpected syntax: " + normalizedProgram);
  }

  return parseApply(expr, normalizedProgram.slice(match[0].length));
}

function parseApply(expr, program) {
  program = skipSpace(program);
  if (program[0] != "(") {
    return { expr: expr, rest: program };
  }

  program = skipSpace(program.slice(1));
  expr = { type: "apply", operator: expr, args: [] };

  while (program[0] != ")") {
    let arg = parseExpression(program);
    expr.args.push(arg.expr);
    program = skipSpace(arg.rest);
    if (program[0] == ",") {
      program = skipSpace(program.slice(1));
    } else if (program[0] != ")") {
      throw new SyntaxError("Expected ',' or ')'");
    }
  }
  return parseApply(expr, program.slice(1));
}

// Removes any initial spaces from the front of an expression
function skipSpace(string) {
  const first = string.search(/\S/);

  return first == -1 ? "" : string.slice(first);
}

console.log(parse("+(a, 10)"));
