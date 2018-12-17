"use strict"
let types = require("./types")
let Symbol = types.Symbol

const Env = function(outer, binds, exprs) {
  this.data = {}
  this.outer = outer

  if (binds) {
    for (let i = 0; i < binds.length; i++) {
      if (binds[i] == "&" && i != binds.length - 1) {
        this.set(binds[i + 1], exprs.slice(i))
        break
      } else {
        this.set(binds[i], exprs[i])
      }
    }
  }
}

Env.prototype.set = function(symbol, value) {
  // console.log(`Env.set ${symbol} = ${value}`)
  if (!(symbol instanceof Symbol)) { throw `${symbol} not a Symbol` }
  this.data[symbol] = value
}

Env.prototype.find = function(symbol) {
  if (!(symbol instanceof Symbol)) { throw `${symbol} not a Symbol` }

  if (this.data.hasOwnProperty(symbol)) {
    return this
  } else if (typeof this.outer != "undefined") {
    return this.outer.find(symbol)
  }
}

Env.prototype.get = function(symbol) {
  if (!(symbol instanceof Symbol)) { throw `${symbol} not a Symbol` }

  let env = this.find(symbol)
  if (typeof env == "undefined") {
    return undefined
  }

  return env.data[symbol]
}

module.exports = Env
