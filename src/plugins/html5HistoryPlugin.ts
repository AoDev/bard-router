import {Location, Path, createBrowserHistory} from 'history'
import Router, {IRequest, RouteParam} from '../Router'

/**
 * Check if two objects have same properties, one level deep
 */
function isEqual(obj1: Record<string, unknown>, obj2: Record<string, unknown>) {
  const obj1Keys = Object.keys(obj1)
  const obj2Keys = Object.keys(obj2)
  return obj1Keys.length === obj2Keys.length && obj1Keys.every((key) => obj1[key] === obj2[key])
}

/**
 * Take the location from history and return it as a router navigation request (IRequest)
 */
function requestFromLocation(location: Location): IRequest {
  const locationParams = new URLSearchParams(location.search)
  const params = [...locationParams.entries()].reduce<RouteParam>((acc, keyVal) => {
    acc[keyVal[0]] = keyVal[1]
    return acc
  }, {})
  return {route: location.pathname, params}
}

/**
 * Create a valid history location from a routing request
 */
function locationFromRequest(request: IRequest) {
  const path: Partial<Path> = {
    pathname: request.route,
  }
  const {params} = request
  const paramsKeys = Object.keys(params)
  if (paramsKeys.length > 0) {
    const searchParams = new URLSearchParams()
    paramsKeys.forEach((key) => searchParams.append(key, String(params[key])))
    path.search = '?' + searchParams.toString()
  }

  return path
}

/**
 * Check and prevent a loop of pushing to history, router listens to change, push to history, ...
 */
function isDifferentRequest(request1: IRequest, request2: IRequest) {
  return request1.route !== request2.route || !isEqual(request1.params, request2.params)
}

/**
 * Note: `register(router)`
 * - must be called when routes have been set on the Router
 * - before any code related to routing is called; because it synchronizes with the current browser url
 *
 * Not doing so may cause unexpected result.
 */
export function register(router: Router) {
  const history = createBrowserHistory()

  /**
   * Sync router -> browser history
   * = User is navigating using the app UI
   */
  router.on('afterNav', ({router, goToOptions}) => {
    const requestFromBrowser = requestFromLocation(history.location)
    if (isDifferentRequest(requestFromBrowser, router)) {
      if (goToOptions.goingBack) {
        history.back()
      } else {
        history.push(locationFromRequest(router.story[0]))
      }
    }
  })

  /**
   * Sync browser history -> router
   * = User is navigating using the url in the browser
   */
  history.listen(({location, action}) => {
    const requestFromApp = requestFromLocation(location)
    if (isDifferentRequest(requestFromApp, router)) {
      router.goTo(requestFromApp.route, requestFromApp.params, {action})
    }
  })
  const browserRequest = requestFromLocation(history.location)
  router.goTo(browserRequest.route, browserRequest.params)

  return history
}

export default {
  register,
}
