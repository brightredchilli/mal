"use strict"
let types = require("./types")
let printer = require("./printer")
let Symbol = types.Symbol

let ns = new Map()
ns.set(new Symbol("+"), (a, b) => a + b)
ns.set(new Symbol("-"), (a, b) => a - b)
ns.set(new Symbol("*"), (a, b) => a * b)
ns.set(new Symbol("/"), (a, b) => a / b)
// ns.set(new Symbol("list"), (...params) => { console.trace(params); return params })
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
