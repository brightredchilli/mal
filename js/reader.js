
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
  if (reader.peek() == '(') {
    return read_list(reader)
  } else {
    return read_atom(reader)
  }
}

var stackcount = 0

function read_list(reader) {
  reader.next()
  let list = []
  while (true) {
    if (reader.peek() == ')') { reader.next(); break }
    if (reader.peek() == undefined) { throw "no matching ) paren" }
    var cur = read_form(reader)
    list.push(cur)
  }
  return list
}

function read_atom(reader) {
  var token = reader.next()
  if (token ==  ")") { throw "no matching ( paren" }
  if (/^-?[0-9]+/.exec(token)) {
    return parseInt(token)
  } else if (/"(?:\\.|[^\\"])*"/.exec(token)) {
    // matches strings
    return token.slice(1, -1)
  } else if (token == "true") {
    return true
  } else if (token == "false") {
    return false
  } else if (token == "nil") {
    return null
  } else {
    return Symbol(token)
  }
}

module.exports.read_str = read_str
module.exports.tokenizer = tokenizer
module.exports.read_form = read_form
module.exports.read_list = read_list
module.exports.read_atom = read_atom
