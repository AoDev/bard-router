/**
 * @param {Array} array
 * @param {*} value
 * @returns {boolean} true if value is in array
 */
export function includes (array, value) {
  return array.indexOf(value) > -1
}

/**
 * @param {Array} array
 * @param {*} value
 */
export function removeFromArray (array, value) {
  const index = array.indexOf(value)
  if (index === -1) {
    return array
  }
  return array.slice(0, index).concat(array.slice(index + 1))
}

/**
 * @see splitPath
 */
export function splitPathReducer (acc, step, index) {
  acc.push(index === 0 ? '' : acc[index - 1] + '/' + step)
  return acc
}

/**
 * Splits a path like "/private/data/..."
 * into ["/", "/private", "/private/data", "/private/data/..."]
 * @param {String} path
 */
export function splitPath (path) {
  if (path === '/') {
    return ['/']
  }
  const pathNodes = path.split('/').reduce(splitPathReducer, [])
  pathNodes[0] = '/'
  return pathNodes
}

/**
 * @param {string[]} pathNode1
 * @param {string[]} pathNode2
 */
export function diffPaths (pathNode1, pathNode2) {
  let index = 0
  while (
    pathNode1[index] === pathNode2[index] &&
    index < pathNode1.length && index < pathNode2.length
  ) {
    index++
  }
  return pathNode2.slice(index)
}
