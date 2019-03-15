"use strict"
let types = require("./types")
let Symbol = types.Symbol

const Env = function(outer, binds, exprs) {
  this.data = new Map()
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

Env.prototype.print = function() {
  console.log('printing env')
  for (let [key, value] of this.data) {
    console.log(`${key} : ${value}`)
  }
}

Env.prototype.set = function(symbol, value) {
  // console.log(`Env.set ${symbol} = ${value}`)
  if (!(symbol instanceof Symbol)) { throw `${symbol} not a Symbol` }
  this.data.set(symbol.value, value)
  // console.log('after set')
  // this.print()
}

Env.prototype.find = function(symbol) {
  if (!(symbol instanceof Symbol)) { throw `${symbol} not a Symbol` }

  // console.log(`finding ${symbol}`)
  if (this.data.has(symbol.value)) {
    // console.log(`found ${symbol}`)
    return this
  } else if (typeof this.outer != "undefined") {
    // console.log(`finding ${symbol} in outer`)
    return this.outer.find(symbol)
  }
    // console.log(`did not find ${symbol}`)
}

Env.prototype.get = function(symbol) {
  if (!(symbol instanceof Symbol)) { throw `${symbol} not a Symbol` }

  let env = this.find(symbol)
  if (typeof env == "undefined") {
    return undefined
  }

  return env.data.get(symbol.value)
}

module.exports = Env
