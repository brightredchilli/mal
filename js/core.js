"use strict"
let types = require("./types")
let printer = require("./printer")
let Symbol = types.Symbol

let ns = new Map()
ns.set(new Symbol("+"), (a, b) => a + b)
ns.set(new Symbol("-"), (a, b) => a - b)
ns.set(new Symbol("*"), (a, b) => a * b)
ns.set(new Symbol("/"), (a, b) => a / b)
ns.set(new Symbol("prn"), (a) => { console.log(printer.pr_str(a, true)); return null; })
ns.set(new Symbol("list"), (...params) => params)
ns.set(new Symbol("list?"), (a) => a instanceof Array)
ns.set(new Symbol("empty?"), (a) => a.length == 0)
ns.set(new Symbol("count"), (a) => a.length)
ns.set(new Symbol("="), (a, b) => equals(a, b))
ns.set(new Symbol("<"), (a, b) => a < b)
ns.set(new Symbol("<="), (a, b) => a <= b)
ns.set(new Symbol(">"), (a, b) => a > b)
ns.set(new Symbol(">="), (a, b) =>  a >= b)

// predicate is a function that takes element and returns bool
Array.prototype.allSatisfy = function(predicate) {
  for (let e of this) {
    if (!predicate(e)) {
      return false
    }
  }
  return true
}

function equals(lhs, rhs) {
   // console.log(`equals ${types.typeOf(lhs)} ${types.typeOf(rhs)})`)
  if (lhs === rhs) { return true }

  if (types.isArrayLike(lhs) && types.isArrayLike(rhs)) {
    if (lhs.length != rhs.length) { return false }
    for (let i = 0; i < lhs.length; i++) {
      if (!equals(lhs[i], rhs[i])) {
        return false
      }
    }
    return true
  } else if (types.isHash(lhs) && types.isHash(rhs)) {
    for (let [lhsKey, lhsValue] of lhs) {
      if (!equals(lhsValue, rhs[lhsKey])) {
        return false
      }
    }
    return true
  } else {
    // console.log("compare value lhs rhs")
  if (types.typeOf(lhs) != types.typeOf(rhs)) { return false }
    return equals(lhs, rhs)
  }
}

module.exports.ns = ns
