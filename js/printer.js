"use strict"
let types = require("./types")
let Symbol = types.Symbol

function pr_str(token) {
  if (token instanceof Array) {
    // console.log("array")
    let arrayString = token.map(t => pr_str(t)).join(" ")
    if (token.isVector) {
      return `[${arrayString}]`
    } else {
      return `(${arrayString})`
    }
  } if (token instanceof Map) {
    let string = ""
    for (let key of Object.keys(token)) {
      string += `${pr_str(key)} ${pr_str(token[key])}`
    }
    return `{${string}}`

  } else if (token == null) {
    return "nil"
  } else if (typeof token == "string") {
    if (token.startsWith("\u029E")) {
      return token.slice(1)
    } else {
      // console.log("string")
      return `"${token}"`
    }
  } else if (token instanceof Symbol) {
    // console.log("symbol")
    return token.toString()
  } else if (typeof token == "function") {
    return `#${token.toString()}`
  } else {
    // console.log("other")
    return token.toString()
  }
}

module.exports.pr_str = pr_str
