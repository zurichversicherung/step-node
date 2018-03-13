module.exports = {
  _value: null,

  set value (newValue) {
    if (!this._value) this._value = newValue
    else throw new Error('Test parameters are already set!')
  },

  get value () {
    return this._value
  }
}
