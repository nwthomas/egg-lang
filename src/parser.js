function parseExpression(program) {
  // finish this
}

function skipSpace(string) {
  const first = string.search(/\S/);

  return first == -1 ? "" : string.slice(first);
}
