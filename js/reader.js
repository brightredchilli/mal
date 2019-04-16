"use strict"
let types = require("./types")
let Symbol = types.Symbol
let NoTokenException = types.NoTokenException

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
  } else if (token == '@') {
    reader.next()
    return [new Symbol("deref"), read_form(reader)]
  } else if (token == '\'') {
    reader.next()
    return [new Symbol("quote"), read_form(reader)]
  } else if (token == '`') {
    reader.next()
    return [new Symbol("quasiquote"), read_form(reader)]
  } else if (token == '~') {
    reader.next()
    return [new Symbol("unquote"), read_form(reader)]
  } else if (token == '~@') {
    reader.next()
    return [new Symbol("splice-unquote"), read_form(reader)]
  } else if (token == '^') {
    reader.next()
    let metadata = read_form(reader)
    let functionName = read_form(reader)
    return [new Symbol("with-meta"), functionName, metadata]
  } else {
    return read_atom(reader)
  }
}

var stackcount = 0

function read_list(reader, endToken) {
  let startToken = reader.next()
  let list = []
  if (startToken == '[') {
    list = types.arrayToVector(list)
  }

  while (true) {
    if (reader.peek() == endToken) { reader.next(); break }
    if (reader.peek() == undefined) { throw `no matching ${endToken} paren` }

    try {
      let cur = read_form(reader)
      list.push(cur)
    } catch (exc) {
      if (exc instanceof NoTokenException) {
        continue
      } else {
        throw exc
      }
    }
  }

  if (startToken == '{') {
    return list.toHashMap()
  } else {
    return list
  }
}

function read_atom(reader) {
  var token = reader.next()
  // console.log(`token ${token}`)
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
  } else if (token[0] == ";") {
    // console.log(`comment ${token}`)
    // matches comments
    throw new NoTokenException()
    return null
  } else if (token == "true") {
    return true
  } else if (token == "false") {
    return false
  } else if (token == "nil") {
    return null
  } else if (token.startsWith(":")) {
    return types.MakeKeyword(token)
  } else {
    return new Symbol(token)
  }
}

module.exports.read_str = read_str
module.exports.tokenizer = tokenizer
