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
    return ast;
}

// print
function PRINT(exp) {
  return printer.pr_str(exp);
}

// repl
var rep = function(str) { return PRINT(EVAL(READ(str), {})); };

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
