// The root parsing function for Egglang
function parse(program) {
  const { expr, rest } = parseExpression(program);

  // Handle bad syntax with unfinished expression
  if (skipSpace(rest).length > 0) {
    throw new SyntaxError("Unexpected text after program");
  }

  // Return total parsed expression of program
  return expr;
}

// Allows the parsing of a given expression in Egglang
function parseExpression(newProgram) {
  const normalizedProgram = skipSpace(newProgram);
  let match, expr;

  // Case for handling strings
  if ((match = /^"([^"]*)"/.exec(normalizedProgram))) {
    expr = { type: "value", value: match[1] };
  }

  // Case for handling numbers
  else if ((match = /^\d+\b/.exec(normalizedProgram))) {
    expr = { type: "value", value: Number(match[0]) };
  }

  // Case for handling words
  else if ((match = /^[^\s(),#"]+/.exec(normalizedProgram))) {
    expr = { type: "word", name: match[0] };
  }

  // Case for when the above aren't true - throw SyntaxError
  else {
    throw new SyntaxError("Unexpected syntax: " + normalizedProgram);
  }

  // If one of the happy cases, run parseApply()
  return parseApply(expr, normalizedProgram.slice(match[0].length));
}

// Allows the parsing of a parenthesized list of arguments if expression
// is not an application
function parseApply(expr, newProgram) {
  let normalizedProgram = skipSpace(newProgram);

  // Handle exit case where expression is not start of new application
  // and preserve existing expression from parent function call
  if (normalizedProgram[0] != "(") {
    return { expr: expr, rest: normalizedProgram };
  }

  // Slice off opening parenthesis
  normalizedProgram = skipSpace(normalizedProgram.slice(1));
  expr = { type: "apply", operator: expr, args: [] };

  // Loop through application until ending parenthesis is hit
  while (normalizedProgram[0] != ")") {
    // Recursively parse existing program using this same process
    const arg = parseExpression(normalizedProgram);

    expr.args.push(arg.expr);
    normalizedProgram = skipSpace(arg.rest);

    // Slice off next argument ", " or ","
    if (normalizedProgram[0] == ",") {
      normalizedProgram = skipSpace(normalizedProgram.slice(1));
    }

    // Else, throw new SyntaxErro
    else if (normalizedProgram[0] != ")") {
      throw new SyntaxError("Expected ',' or ')'");
    }
  }

  // Recursively call itself
  return parseApply(expr, normalizedProgram.slice(1));
}

// Removes any initial spaces from the front of an expression
function skipSpace(string) {
  // Find first occurance of " " char
  const first = string.search(/\S/);

  // Return sliced off space char or else empty string
  return first == -1 ? "" : string.slice(first);
}

module.exports = parse;
