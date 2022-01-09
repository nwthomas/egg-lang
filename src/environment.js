const topScope = Object.create(null);

// Add booleans to the scope
topScope.true = true;
topScope.false = false;

// Add relevant operators to scope
for (const op of ["+", "-", "*", "/", "==", "<", ">"]) {
  topScope[op] = Function("a, b", `return a ${op} b;`);
}

// Add print/console.log functionality
topScope.print = (value) => console.log(value);

module.exports = topScope;
