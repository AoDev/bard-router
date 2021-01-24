/**
 * Check if a value is in an array
 */
export function includes<V>(array: any[], value: V) {
  return array.indexOf(value) > -1
}

/**
 * Remove a value from an array
 */
export function removeFromArray<V>(array: any[], value: V) {
  const index = array.indexOf(value)
  if (index === -1) {
    return array
  }
  return array.slice(0, index).concat(array.slice(index + 1))
}

/**
 * @see splitPath
 */
export function splitPathReducer(acc: any[], step: string, index: number) {
  acc.push(index === 0 ? '' : acc[index - 1] + '/' + step)
  return acc
}

/**
 * Splits a path like "/private/data/..."
 *
 * into ["/", "/private", "/private/data", "/private/data/..."]
 */
export function splitPath(path: string): string[] {
  if (path === '/') {
    return ['/']
  }
  const pathNodes = path.split('/').reduce(splitPathReducer, [])
  pathNodes[0] = '/'
  return pathNodes
}

/**
 */
export function diffPaths(pathNode1: string[], pathNode2: string[]) {
  let index = 0
  while (
    pathNode1[index] === pathNode2[index] &&
    index < pathNode1.length &&
    index < pathNode2.length
  ) {
    index++
  }
  return pathNode2.slice(index)
}
