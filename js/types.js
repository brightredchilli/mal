"use strict"

Array.prototype.isVector = false
Array.prototype.toHashMap = function() {
  let dictionary = new Map()
  this.forEach((val, index, array) => {
    if (index % 2 == 1) {
      let key = array[index - 1]
      if (typeof key != 'string') {
        throw `dictionary key must be string, found ${key}`
      }
      dictionary.set(key, val)
    }
  })

  return dictionary
}

/// Adds keys and values of other into self
Map.prototype.assoc = function(other) {
  for (let item of other) {
    this.set(item[0], item[1])
  }
}

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


// extends all javascript function types
Function.prototype.is_macro = false
MalFunction.prototype.is_macro = false

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

// assumes argument is a string
const MakeKeyword = str => "\u029E" + str

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
  return isVector(token) || isArray(token)
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

let isMacro = token => {
  return token instanceof Symbol
}

let arrayToVector = array => {
  let copy = clone(array)
  copy.isVector = true
  return copy
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

/// Used for essentially making sure that shallow copies are made recursively
function clone(obj) {
  // Handle Array
  if (isArrayLike()) {
    let copy = obj.map(elem => clone(elem))
    copy.isVector = obj.isVector
    return copy
  }

  // Handle Object
  if (isHash(obj)) {
    let copy = new Map()
    for (let elem of obj) {
      copy.set(elem[0], clone(elem[1]))
    }
    return copy
  }

  // mal values string, keyword, null, function, atom are all immutable
  // so the original can be returned here
  return obj
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
module.exports.MakeKeyword = MakeKeyword
module.exports.arrayToVector = arrayToVector
module.exports.clone = clone
