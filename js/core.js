"use strict"
const fs = require('fs')
const path = require('path')
const readline = require('./node_readline')
let types = require("./types")
let printer = require("./printer")
let reader = require("./reader")
let Symbol = types.Symbol
let MalAtom = types.MalAtom
let MalFunction = types.MalFunction

let ns = new Map()
ns.set(new Symbol("+"), (a, b) => a + b)
ns.set(new Symbol("-"), (a, b) => a - b)
ns.set(new Symbol("*"), (a, b) => a * b)
ns.set(new Symbol("/"), (a, b) => a / b)
ns.set(new Symbol("list"), (...params) => params)
ns.set(new Symbol("list?"), (a) => types.isArray(a))
ns.set(new Symbol("empty?"), (a) => a.length == 0)
ns.set(new Symbol("count"), (a) => a instanceof Array ? a.length : 0)
ns.set(new Symbol("="), (a, b) => equals(a, b))
ns.set(new Symbol("<"), (a, b) => a < b)
ns.set(new Symbol("<="), (a, b) => a <= b)
ns.set(new Symbol(">"), (a, b) => a > b)
ns.set(new Symbol(">="), (a, b) => a >= b)
ns.set(new Symbol("pr-str"), (...params) => params.map(a => printer.pr_str(a, true)).join(" "))
ns.set(new Symbol("str"), (...params) => params.map(a => printer.pr_str(a, false)).join(""))
ns.set(new Symbol("prn"), (...params) => { console.log(params.map(a => printer.pr_str(a, true)).join(" ")); return null; })
ns.set(new Symbol("println"), (...params) => { console.log(params.map(a => printer.pr_str(a, false)).join(" ")); return null; })
ns.set(new Symbol("read-string"), a => reader.read_str(a))
ns.set(new Symbol("slurp"), filename => {
   return fs.readFileSync(path.resolve(__dirname, filename), 'utf8')
})
ns.set(new Symbol("atom"), a => new MalAtom(a))
ns.set(new Symbol("atom?"), a => types.isAtom(a))
ns.set(new Symbol("deref"), a => a.value)
ns.set(new Symbol("reset!"), (atom, value) => reset(atom, value))
ns.set(new Symbol("swap!"), (atom, f, ...args) => {
  if (typeof f === "function") {
    return reset(atom, f(atom.value, ...args))
  } else if (f instanceof MalFunction) {
    // console.log(`swap args: ${args}`)
    return reset(atom, f.fn(atom.value, ...args))
  }
})
ns.set(new Symbol("cons"), (first, rest) => [first].concat(rest))
ns.set(new Symbol("concat"), (...params) => {
  if (params.length == 0) { return [] }
  return params.reduce((acc, next) => acc.concat(next))
})
ns.set(new Symbol("nth"), (array, i) => {
  if (i >= array.length) {
    throw new RangeError(`The index ${i} exceeds array length ${array.length}`)
  }
  return array[i]
})
ns.set(new Symbol("first"), (array) => {
  if (array == null || array == undefined || array.length == 0) {
    return null
  }
  return array[0]
})
ns.set(new Symbol("rest"), (array) => types.isArrayLike(array) ? array.slice(1) : [])
ns.set(new Symbol("throw"), (arg) => { throw arg })
ns.set(new Symbol("apply"), (fn, ...rest) => {
  // console.log(`fn=${fn}, rest=${res...t}`)
  let args = rest.reduce((acc, next) => acc.concat(next), [])
  // console.log(`fn=${fn}, rest=${rest}, args= ${args}`)
  if (fn instanceof MalFunction) {
    fn = fn.fn
  }
  return fn(...args)
})
ns.set(new Symbol("map"), (fn, array) => {
  if (fn instanceof MalFunction) {
    fn = fn.fn
  }
  return array.map(fn)
})

// Predicates
ns.set(new Symbol("nil?"), arg => types.isNull(arg))
ns.set(new Symbol("true?"), arg => arg === true)
ns.set(new Symbol("false?"), arg => arg === false)
ns.set(new Symbol("symbol?"), arg => types.isSymbol(arg))
ns.set(new Symbol("symbol"), arg => {
  if (!types.isString(arg)) {
    throw `symbol: ${arg} is not a string`
  }
  return new Symbol(arg)
})
ns.set(new Symbol("keyword"), arg => {
  if (!types.isString(arg)) {
    throw `keyword: ${arg} is not a string`
  }

  if (types.isKeyword(arg)) {
    return arg
  } else {
    if (arg.startsWith(":")) {
      return types.MakeKeyword(arg)
    } else {
      return types.MakeKeyword(":" + arg)
    }
  }
})
ns.set(new Symbol("keyword?"), arg => types.isKeyword(arg))
ns.set(new Symbol("vector"), (...args) => types.arrayToVector(args))
ns.set(new Symbol("vector?"), arg => types.isVector(arg))
ns.set(new Symbol("hash-map"), (...args) => types.clone(args).toHashMap())
ns.set(new Symbol("map?"), arg => types.isHash(arg))
ns.set(new Symbol("assoc"), (hash, ...args) => {
  let copy = types.clone(hash)
  let otherArgs = args.toHashMap()
  copy.assoc(otherArgs)
  return copy
})
ns.set(new Symbol("dissoc"), (hash, ...keys) => {
  let copy = types.clone(hash)
  for (let key of keys) {
    copy.delete(key)
  }
  return copy
})
ns.set(new Symbol("get"), (hash, key) => {
  if (!hash) { return null }
  if (hash.has(key)) {
    return hash.get(key)
  } else {
    return null
  }
})
ns.set(new Symbol("contains?"), (hash, key) => {
  if (!hash) { return false }
  return hash.has(key)
})
ns.set(new Symbol("keys"), hash => [...hash.keys()])
ns.set(new Symbol("vals"), hash => [...hash.values()])

ns.set(new Symbol("sequential?"), arg => types.isArrayLike(arg))
ns.set(new Symbol("readline"), prompt => {
  let answer = readline.readline(prompt)
  return answer
})

ns.set(new Symbol("meta"), fn => fn.metadata)
ns.set(new Symbol("with-meta"), (fn, metadata) => fn.withMetadata(metadata))
ns.set(new Symbol("js-eval"), str => eval(str))
ns.set(new Symbol("number?"), arg => types.isNumber(arg))
ns.set(new Symbol("string?"), arg => types.isString(arg))
ns.set(new Symbol("fn?"), arg => types.isFunction(arg))
ns.set(new Symbol("macro?"), arg => types.isMacro(arg))
ns.set(new Symbol("conj"), (arg, ...rest) => {
  if (!types.isArrayLike(arg)) { return arg }
  if (types.isVector(arg)) {
    return arg.concat(rest)
  } else {
    rest.reverse()
    return rest.concat(arg)
  }
})

ns.set(new Symbol("seq"), arg => {
  if (types.isVector(arg) && arg.length != 0) {
    let copy = types.clone(arg)
    copy.isVector = false
    return copy
  } else if (types.isArray(arg) && arg.length != 0) {
    return arg
  } else if (types.isString(arg) && arg.length != 0) {
    return arg.split("")
  }
  return null
})

ns.set(new Symbol("time-ms"), () => {
  return (new Date()).valueOf()
})


// predicate is a function that takes element and returns bool
Array.prototype.allSatisfy = function(predicate) {
  for (let e of this) {
    if (!predicate(e)) {
      return false
    }
  }
  return true
}

function reset(atom, value) {
  atom.value = value
  return value
}

function equals(lhs, rhs) {
   // console.log(`equals ${types.typeOf(lhs)} ${types.typeOf(rhs)})`)
  if (lhs === rhs) { return true }
  const bothArrays = types.isArrayLike(lhs) && types.isArrayLike(rhs)
  const sameTypes = types.typeOf(lhs) == types.typeOf(rhs)
  if (!(sameTypes || bothArrays)) { return false }

  if (bothArrays) {
    if (lhs.length != rhs.length) { return false }
    for (let i = 0; i < lhs.length; i++) {
      if (!equals(lhs[i], rhs[i])) {
        return false
      }
    }
    return true
  }

  if (types.isHash(lhs)) {
    let lhsKeys = [...lhs.keys()]
    let rhsKeys = [...rhs.keys()]
    lhsKeys.sort()
    rhsKeys.sort()
    if (!equals(lhsKeys, rhsKeys)) { return false }

    for (let lhsKey of lhsKeys) {
      if (!equals(lhs.get(lhsKey), rhs.get(lhsKey))) {
        return false
      }
    }
    return true
  } else if (types.isSymbol(lhs)) {
    return lhs.value == rhs.value
  } else {
    return lhs == rhs
  }
}


module.exports.ns = ns
