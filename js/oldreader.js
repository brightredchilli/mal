

const Reader = function(tokens) {

  this.tokens = tokens
  this.position = 0

  this.next = function () {
    const cur = this.peek()
    this.position += 1
    return cur
  }

  this.peek = function () {
    return this.tokens[position]
  }


  this.read_str = function(str) {

  }

  this.tokenizer = function(str) {

    const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"|;.*|[^\s\[\]{}('"`,;)]*)/
    return str.match(re)
  }

  this.read_from = function () {

  }

}
