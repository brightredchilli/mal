
function pr_str(token) {
  if (token instanceof Array) {
    // console.log("array")
    let arrayString = token.map(t => pr_str(t)).join(" ")
    if (token.isVector) {
      return `[${arrayString}]`
    } else {
      return `(${arrayString})`
    }
  } else if (token == null) {
    return "nil"
  } else if (typeof token == "string") {
    if (token.startsWith("\u029E")) {
      return token.slice(1)
    } else {
      // console.log("string")
      return `"${token}"`
    }
  } else if (typeof token == "symbol") {
    // console.log("symbol")
    return token.toString().slice(7,-1)
  } else {
    // console.log("other")
    return token.toString()
  }
}

module.exports.pr_str = pr_str
