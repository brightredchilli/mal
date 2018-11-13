let types = require("./types")
let Env = require("./env")
let Symbol = types.Symbol

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
  let first, second, third
  if (ast instanceof Array && !ast.isVector) {
    if (ast.length == 0) { return ast }
    switch (String(ast[0])) {
      case "def!":
        [__, first, second] = ast
        // console.log(`def! first=${first} second=${second}`)
        let value = EVAL(second, env)
        // console.log(`def! value=${value}`)
        env.set(first, value)
        return value
        break
      case "let*":
        [__, first, second] = ast
        // console.log(`let* first=${first} second=${second}`)
        let newEnv = new Env(env)
        for (var i = 0; i < first.length - 1 ; i += 2) {
          // console.log(`first[${i}]=${first[i]}`)
          newEnv.set(first[i], EVAL(first[i+1], newEnv))
        }

        // console.log(`new env=${JSON.stringify(newEnv.data)}`)
        return EVAL(second, newEnv)
      case "do":
        let results = eval_ast(ast.slice(1))
        return results[-1]
      case "if":
        [__, first, second, third] = ast
        let first_result = EVAL(first, env)
        if (first_result != null && first_result != false) {
          return EVAL(second, env)
        } else if (third != undefined) {
          return EVAL(third, env)
        }
        return null
      case "fn*":
        [__, first, second] = ast
        return (...args) => {
          let newEnv = new Env(env, first, args)
          return EVAL(second, newEnv)
        }
        break
      default:
        [f, ...args] = eval_ast(ast, env)
        return f(...args)
    }
  } else {
    // console.log(`EVAL eval_ast ast=${ast}`)
    return eval_ast(ast, env)
  }
}

// print
function PRINT(exp) {
  return printer.pr_str(exp);
}

// repl
var environment = new Env()
environment.set(new Symbol("+"), (a, b) => a + b)
environment.set(new Symbol("-"), (a, b) => a - b)
environment.set(new Symbol("*"), (a, b) => a * b)
environment.set(new Symbol("/"), (a, b) => a / b)

function eval_ast(ast, env) {
  if (ast instanceof Array) {
    // console.log(`ast is Array`)
    let mapped = ast.map(a => EVAL(a, env))
    mapped.isVector = ast.isVector
    return mapped
  } if (ast instanceof Map) {
    // console.log(`ast is Map`)
    let mapped = new Map()
    for (const key of Object.keys(ast)) {
      mapped[key] = EVAL(ast[key], env)
    }
    return mapped
  } else if (ast instanceof Symbol) {
    let value = env.get(ast)
    if (value === undefined) {
      throw `symbol ${ast} not found`
    } else {
      // console.log(`ast is Symbol, value=${value}`)
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
