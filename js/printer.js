"use strict"
let types = require("./types")
let Symbol = types.Symbol

function pr_str(token, print_readably) {
  if (typeof print_readably === 'undefined') { print_readably = true }

  if (types.isArray(token)) {
    return `(${token.map(t => pr_str(t, print_readably)).join(" ")})`
  } else if (types.isVector(token)) {
    return `[${token.map(t => pr_str(t, print_readably)).join(" ")}]`
  } else if (types.isHash(token)) {
    // console.log("isHash")
    let strings = []
    for (let key of token.keys()) {
      strings.push(`${pr_str(key)} ${pr_str(token.get(key), print_readably)}`)
    }
    return `{${strings.join(" ")}}`

  } else if (types.isNull(token)) {
    return "nil"
  } else if (types.isString(token)) {
    // console.log("string")
    if (print_readably) {
      var readable = token
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
      return `"${readable}"`
    } else {
      return token
    }
  } else if (types.isKeyword(token)) {
    return token.slice(1)
  } else if (types.isSymbol(token)) {
    // console.log("symbol")
    return token.toString()
  } else if (types.isFunction(token)) {
    return `#<function>`
  } else if (types.isAtom(token)) {
    return `(atom ${token.value})`
  } else {
    // console.log("other")
    return token.toString()
  }
}

module.exports.pr_str = pr_str
