const Symbol = function(value) {
  if (typeof value != "string") {
    throw `${value} is not a string!`
  }
  this.value = value
}

Symbol.prototype.toString = function() {
  return this.value
}

module.exports.Symbol = Symbol

