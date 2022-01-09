// Handle special words that give directives for applications
const specialForms = Object.create(null);

specialForms.do = (args, scope) => {
  let value = false;

  for (let arg of args) {
    value = evaluate(arg, scope);
  }

  return value;
};

specialForms.if = (args, scope) => {
  if (args.length != 3) {
    throw new SyntaxError("Wrong number of args to if");
  } else if (evaluate(args[0], scope) !== false) {
    return evaluate(args[1], scope);
  } else {
    return evaluate(args[2], scope);
  }
};

specialForms.while = (args, scope) => {
  if (args.length != 2) {
    throw new SyntaxError("Wrong number of args to while");
  }

  while (evaluate(args[0], scope) !== false) {
    evaluate(args[1], scope);
  }

  // Since undefined does not exist in Egg, we return false,
  // for lack of a meaningful result.
  return false;
};

specialForms.define = (args, scope) => {
  if (args.length != 2 || args[0].type != "word") {
    throw new SyntaxError("Incorrect use of define");
  }

  const value = evaluate(args[1], scope);

  scope[args[0].name] = value;

  return value;
};

specialForms.fun = (args, scope) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body");
  }

  const body = args[args.length - 1];

  const params = args.slice(0, args.length - 1).map((expr) => {
    if (expr.type != "word") {
      throw new SyntaxError("Parameter names must be words");
    }
    return expr.name;
  });

  return function () {
    if (arguments.length != params.length) {
      throw new TypeError("Wrong number of arguments");
    }

    const localScope = Object.create(scope);
    for (const i = 0; i < arguments.length; i++) {
      localScope[params[i]] = arguments[i];
    }

    return evaluate(body, localScope);
  };
};

// Handle evaluating any AST from Eggland given to it
function evaluate(expr, scope) {
  // Handle case where expression type is a value
  if (expr.type == "value") {
    return expr.value;
  }

  // Handle case where expression is word in scope
  else if (expr.type == "word" && expr.name in scope) {
    return scope[expr.name];
  }

  // Handle case where expression is word and NOT in scope
  else if (expr.type === "word") {
    throw new ReferenceError(`Undefined binding: ${expr.name}`);
  }

  // Handle case where expression is type apply and pull from special forms
  else if (expr.type == "apply") {
    const { operator, args } = expr;

    // If apply type and in specialForms object
    if (operator.type == "word" && operator.name in specialForms) {
      return specialForms[operator.name](expr.args, scope);
    }

    // Else recursively evaluate operator and scope
    else {
      const op = evaluate(operator, scope);

      // If returned type of evaluate is function, run it with recursive calls to evaluate
      if (typeof op == "function") {
        return op(...args.map((arg) => evaluate(arg, scope)));
      }

      // Else throw TypeError
      else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}

module.exports = evaluate;
