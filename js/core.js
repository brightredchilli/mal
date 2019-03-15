"use strict"
const fs = require('fs')
const path = require('path')
let types = require("./types")
let printer = require("./printer")
let reader = require("./reader")
let Symbol = types.Symbol
let MalAtom = types.MalAtom

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
  } else if (f instanceof types.MalFunction) {
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
    for (let [lhsKey, lhsValue] of lhs) {
      if (!equals(lhsValue, rhs[lhsKey])) {
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
