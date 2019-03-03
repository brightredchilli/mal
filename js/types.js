"use strict"
const NoTokenException = function () { }

const Symbol = function(value) {
  if (typeof value != "string") {
    throw `${value} is not a string!`
  }
  this.value = value
}

const MalFunction = function(ast, params, env, fn) {
  this.ast = ast
  this.params = params
  this.env = env
  this.fn = fn
}

const MalAtom = function(value) {
  this.value = value
}

Symbol.prototype.toString = function() {
  return this.value
}

let isString = token => {
  return typeof token == "string" && !token.startsWith("\u029E")
}

let isKeyword = token => {
  return typeof token == "string" && token.startsWith("\u029E")
}

let isNull = token => {
  return token == null
}

let isHash = token => {
  return token instanceof Map
}

let isArray = token => {
  return token instanceof Array && !token.isVector
}

let isVector = token => {
  return token instanceof Array && token.isVector
}

let isArrayLike = token => {
  return module.exports.isVector(token) || module.exports.isArray(token)
}

let isFunction = token => {
  return typeof token == "function" || token instanceof MalFunction
}

let isAtom = token => {
  return token instanceof MalAtom
}

let isSymbol = token => {
  return token instanceof Symbol
}

let typeOf = token => {
  if (isArray(token)) {
    return "__mal_array__"
  } else if (isVector(token)) {
    return "__mal_vector__"
  } else if (isHash(token)) {
    return "__mal_hash__"
  } else if (isNull(token)) {
    return "__mal_null__"
  } else if (isString(token)) {
    return "__mal_string__"
  } else if (isKeyword(token)) {
    return "__mal_keyword__"
  } else if (isSymbol(token)) {
    return "__mal_symbol__"
  } else if (isFunction(token)) {
    return "__mal_function__"
  } else {
    return undefined
  }
}

module.exports.isString = isString
module.exports.isKeyword = isKeyword
module.exports.isNull = isNull
module.exports.isHash = isHash
module.exports.isArray = isArray
module.exports.isVector = isVector
module.exports.isArrayLike = isArrayLike
module.exports.isFunction = isFunction
module.exports.isSymbol = isSymbol
module.exports.isAtom = isAtom
module.exports.typeOf = typeOf
module.exports.Symbol = Symbol
module.exports.MalFunction = MalFunction
module.exports.MalAtom = MalAtom
module.exports.NoTokenException = NoTokenException
