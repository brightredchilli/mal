"use strict"
let types = require("./types")
let Symbol = types.Symbol

Array.prototype.isVector = false

var Reader = function(tokens) {
  this.tokens = tokens
  this.position = 0

  this.next = function () {
    var token = this.peek()
    this.position++
    return token
  }

  this.peek = function () {
    return this.tokens[this.position]
  }
}

/**
 * Takes a string, returns an array of tokens
 */
function read_str(string) {
  return read_form(new Reader(tokenizer(string)))
}

function tokenizer(string) {
  var re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"|;.*|[^\s\[\]{}('"`,;)]*)/g
  var result
  var tokens = []
  while (true) {
    let result = re.exec(string)
    if (result != null && result.index < string.length && result[1] != '') {
      tokens.push(result[1])
    } else {
      break
    }
  }
  return tokens
}

function read_form(reader) {
  let token = reader.peek()
  if (token == '(' || token == '[' || token == '{') {
    let endToken = token == '(' ? ')' : token == '{' ? '}' : ']'
    return read_list(reader, endToken)
  } else {
    return read_atom(reader)
  }
}

var stackcount = 0

function read_list(reader, endToken) {
  let startToken = reader.next()
  let list = []
  if (startToken == '[') {
    list.isVector = true
  }
  while (true) {
    if (reader.peek() == endToken) { reader.next(); break }
    if (reader.peek() == undefined) { throw `no matching ${endToken} paren` }
    var cur = read_form(reader)
    list.push(cur)
  }

  if (startToken == '{') {
    return list.mapToHash()
  } else {
    return list
  }
}

Array.prototype.mapToHash = function() {
  let dictionary = new Map()
  this.forEach((val, index, array) => {
    if (index % 2 == 1) {
      let key = array[index - 1]
      if (typeof key != 'string') {
        throw `dictionary key must be string, found ${key}`
      }
      dictionary[key] = val
    }
  })

  return dictionary
}

function read_atom(reader) {
  var token = reader.next()
  switch (token) {
    case ")":
      throw "no matching ( paren"
      break
    case "]":
      throw "no matching [ paren"
      break
    case "}":
      throw "no matching } paren"
      break
    default:
      // no-op
      break
  }
  if (/^-?[0-9]+/.exec(token)) {
    return parseInt(token)
  } else if (/"(?:\\.|[^\\"])*"/.exec(token)) {
    // matches strings
    return token.slice(1, -1)
      .replace(/(\\.)/g, (_, match) => match == "\\n" ? "\n" : match[1])
  } else if (token == "true") {
    return true
  } else if (token == "false") {
    return false
  } else if (token == "nil") {
    return null
  } else if (token.startsWith(":")) {
    return "\u029E" + token
  } else {
    return new Symbol(token)
  }
}

module.exports.read_str = read_str
module.exports.tokenizer = tokenizer
module.exports.read_form = read_form
module.exports.read_list = read_list
module.exports.read_atom = read_atom
