"use strict"
let types = require("./types")
const core = require("./core")
let Env = require("./env")
let Symbol = types.Symbol
let MalFunction = types.MalFunction
const argv = process.argv.slice(2)

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
  while(true) {
    if (ast instanceof Array && !ast.isVector) {
      if (ast.length == 0) { return ast }
      switch (String(ast[0])) {
        case "def!": {
          let [__, first, second] = ast
          // console.log(`def! first=${first} second=${second}`)
          let value = EVAL(second, env)
          // console.log(`def! value=${value}`)
          env.set(first, value)
          return value
          break
        }
        case "let*": {
          let [__, first, second] = ast
          // console.log(`let* first=${first} second=${second}`)
          let newEnv = new Env(env)
          for (var i = 0; i < first.length - 1 ; i += 2) {
            // console.log(`first[${i}]=${first[i]}`)
            newEnv.set(first[i], EVAL(first[i+1], newEnv))
          }

          // console.log(`new env=${JSON.stringify(newEnv.data)}`)
          ast = second
          env = newEnv
          break
        }
        case "do": {
          let results = eval_ast(ast.slice(1, -1), env)
          ast = ast[ast.length - 1]
          break
        }
        case "if": {
          let [__, first, second, third] = ast
          // console.log(`if ${first} ${second} ${third}`)
          let first_result = EVAL(first, env)
          // console.log(`first_result = ${first_result}`)
          if (first_result !== null && first_result !== false) {
            // console.log(`second=${second} second_result = ${second_result}`)
            ast = second
            continue
          } else if (third != undefined) {
            ast = third
            continue
          }
          return null
          break
        }
        case "fn*": {
          let [__, first, second] = ast
          let fn = (...args) => {
            // console.log(`first: ${first} args: ${args}`)
            let newEnv = new Env(env, first, args)
            return EVAL(second, newEnv)
          }
          return new MalFunction(second, first, env, fn)
          break
        }
        default: {
          let [f, ...args] = eval_ast(ast, env)
          if (f instanceof MalFunction) {
            // console.log(`f is MalFunction, f.fn: ${f.fn}, args: ${printer.pr_str(args)}`)
            ast = f.ast
            let newEnv = new Env(f.env, f.params, args)
            env = newEnv
          } else {
            // console.log(`f is regular function: ${f}, args: ${printer.pr_str(args)}`)
            return f(...args)
          }
        }
      }
    } else {
      // console.log(`EVAL eval_ast ast=${ast}`)
      return eval_ast(ast, env)
    }
  }
}

// print
function PRINT(exp) {
  return printer.pr_str(exp, true);
}

// repl_env
var repl_env = new Env()

for (let [k, v] of core.ns) {
  repl_env.set(k, v)
}

repl_env.set(new Symbol("eval"), ast => EVAL(ast, repl_env))

function eval_ast(ast, env) {
  if (ast instanceof Array) {
    let mapped = ast.map(a => EVAL(a, env))
    mapped.isVector = ast.isVector
    // console.log(`ast is Array mapped is ${mapped}`)
    return mapped
  } else if (ast instanceof Map) {
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
      // console.log(`ast is Symbol=${ast}, value=${value}`)
      return value
    }
  } else {
    return ast
  }
}

var rep = function(str) { return PRINT(EVAL(READ(str), repl_env)); }
rep("(def! not (fn* (a) (if a false true)))")
rep("(def! load-file (fn* (f) (eval (read-string (str \"(do \" (slurp f) \")\")))))")


// repl loop
while (true) {
  let cmd_args = argv.slice(1)
  repl_env.set(new Symbol("*ARGV*"), cmd_args)
  if (argv.length > 0) {
    let filename = argv[0]

    rep(`(load-file "${filename}")`)
    return
  }
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
    if (exc instanceof types.NoTokenException) {
      continue
    }
    console.log("Exception caught:")
    if (exc.stack) {
      console.log(exc.stack)
    } else {
      console.trace(exc)
    }
  }
}
