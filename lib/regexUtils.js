
/**
 * Escape characters that could cause trouble when string is converted in regular expression.
 * @param {String} str
 */
function escapeString (str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

export default {
  escapeString,
}
