import _createBrowserHistory from 'history/createBrowserHistory'

function isEqual (obj1, obj2) {
  const obj1Keys = Object.keys(obj1)
  const obj2Keys = Object.keys(obj2)
  if (obj1Keys.length !== obj2Keys.length) {
    return false
  }
  for (let i = 0; i < obj1Keys.length; i++) {
    if (obj1[obj1Keys[i]] !== obj2[obj1Keys[i]]) {
      return false
    }
  }
  return true
}

/**
 * @param {*} location
 * @returns {{route: string, params}}
 */
function requestFromLocation (location) {
  const queryString = location.search.slice(1)
  return {
    route: location.pathname,
    params: queryString === ''
      ? {}
      : location.search.slice(1).split('&').reduce((acc, nameValue) => {
        const [name, value] = nameValue.split('=')
        acc[name] = value
        return acc
      }, {})
  }
}

/**
 * @param {*} request
 */
function locationFromRequest (request) {
  const location = {
    pathname: request.route
  }
  const paramsKeys = Object.keys(request.params)
  if (paramsKeys.length > 0) {
    location.search = '?' + Object.keys(request.params).map((key) => `${key}=${request.params[key]}`).join('&')
  }
  return location
}

/**
 * @param {*} request1
 * @param {*} request2
 */
function isDifferentRequest (request1, request2) {
  return request1.route !== request2.route || !isEqual(request1.params, request2.params)
}

/**
 * @param {*} router
 * @returns {History}
 */
export function createHistory (router, options = {}) {
  const history = _createBrowserHistory()

  router.on('nav', (router, goToOptions) => {
    const requestFromBrowser = requestFromLocation(history.location)
    if (isDifferentRequest(requestFromBrowser, router)) {
      if (goToOptions.goingBack) {
        history.goBack()
      }
      else {
        history.push(locationFromRequest(router.history[0]))
      }
    }
  })

  history.listen((location, action) => {
    const newRequest = requestFromLocation(location)
    if (isDifferentRequest(newRequest, router)) {
      router.goTo(newRequest, {action})
    }
  })

  return history
}

export default {
  createHistory,
}
