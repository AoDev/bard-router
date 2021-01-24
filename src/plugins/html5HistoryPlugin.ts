import {createBrowserHistory} from 'history'
import BardRouter, {IRequest} from '../BardRouter'

/**
 * Check if two objects have same properties, one level deep
 */
function isEqual(obj1: any, obj2: any) {
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
function requestFromLocation(location: {pathname: string; search: string}) {
  const queryString = location.search.slice(1)
  return {
    route: location.pathname,
    params:
      queryString === ''
        ? {}
        : location.search
            .slice(1)
            .split('&')
            .reduce((acc, nameValue) => {
              const [name, value] = nameValue.split('=')
              acc[name] = value
              return acc
            }, {} as Record<string, string | number>),
  }
}

/**
 * @param {*} request
 */
function locationFromRequest(request: IRequest) {
  const location: {search?: string; pathname: string} = {
    pathname: request.route,
  }
  const paramsKeys = Object.keys(request.params)
  if (paramsKeys.length > 0) {
    location.search =
      '?' +
      Object.keys(request.params)
        .map((key) => `${key}=${request.params[key]}`)
        .join('&')
  }
  return location
}

/**
 * @param {*} request1
 * @param {*} request2
 */
function isDifferentRequest(request1: IRequest, request2: IRequest) {
  return request1.route !== request2.route || !isEqual(request1.params, request2.params)
}

/**
 */
export function register(router: BardRouter) {
  const history = createBrowserHistory()

  /**
   * Sync router -> browser history
   * = User is navigating using the app UI
   */
  router.on('afterNav', ({router, goToOptions}) => {
    const requestFromBrowser = requestFromLocation(history.location)
    if (isDifferentRequest(requestFromBrowser, router)) {
      if (goToOptions.goingBack) {
        history.goBack()
      } else {
        history.push(locationFromRequest(router.story[0]))
      }
    }
  })

  /**
   * Sync browser history -> router
   * = User is navigating using the url in the browser
   */
  history.listen((location, action) => {
    const newRequest = requestFromLocation(location)
    if (isDifferentRequest(newRequest, router)) {
      router.goTo(newRequest, {action})
    }
  })

  router.goTo(requestFromLocation(history.location))

  return history
}

export default {
  register,
}
