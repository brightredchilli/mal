if (typeof module !== 'undefined') {
    var readline = require('./node_readline');
    var printer = require('./printer');
    var reader = require('./reader');
}
process.on('SIGINT', function() {
  process.exit();
});

// read
function READ(str) {
    return reader.read_str(str);
}

// eval
function EVAL(ast, env) {
  if (ast instanceof Array && !ast.isVector) {
    if (ast.length == 0) { return ast }
    [f, ...args] = eval_ast(ast, env)
    return f(...args)
  } else {
    return eval_ast(ast, env)
  }
}

// print
function PRINT(exp) {
  return printer.pr_str(exp);
}

// repl
var environment = {}
environment[Symbol("+").toString()] = function(a, b) { return a + b }
environment[Symbol("-").toString()] = function(a, b) { return a - b }
environment[Symbol("*").toString()] = function(a, b) { return a * b }
environment[Symbol("/").toString()] = function(a, b) { return a / b }

function eval_ast(ast, env) {
  if (ast instanceof Array) {
    let mapped = ast.map(a => EVAL(a, env))
    mapped.isVector = ast.isVector
    return mapped
  } else if (typeof ast == "symbol") {
    let value = env[ast.toString()]
    if (value === undefined) {
      throw "token not found"
    } else {
      return value
    }
  } else {
    return ast
  }
}

var rep = function(str) { return PRINT(EVAL(READ(str), environment)); };

// repl loop
while (true) {
  var line = readline.readline("user> ");
  if (line === null) {
    break;
  }
  try {
    if (line) {
      if (line == "quit") { break }
      console.log(rep(line))
    }
  } catch (exc) {
    console.log("Exception caught:")
    if (exc.stack) {
      console.log(exc.stack)
    } else {
      console.log(exc)
    }
  }
}
