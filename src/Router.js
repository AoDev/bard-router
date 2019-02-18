const logger = console

function removeFromArray (array, value) {
  const index = array.indexOf(value)
  if (index === -1) {
    return array
  }
  return array.slice(0, index).concat(array.slice(index + 1))
}

/**
 * Escape characters that could cause trouble when string is converted in regular expression.
 * @param {String} str
 */
function escapeString (str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

/**
 * @see splitPath
 */
function splitPathReducer (acc, step, index) {
  acc.push(index === 0 ? '' : acc[index - 1] + '/' + step)
  return acc
}

/**
 * Splits a path like "/private/data/..."
 * into ["/", "/private", "/private/data", "/private/data/..."]
 * @param {String} path
 */
export function splitPath (path) {
  const pathNodes = path.split('/').reduce(splitPathReducer, [])
  pathNodes[0] = '/'
  return pathNodes
}

/**
 * Clone a request object.
 * - Route is copied as is.
 * - Params first level props will be cloned.
 *   It is expected that params are only one level deep.
 * @param {Object} request
 * @param {String} request.route
 * @param {Object} request.params
 */
export function copyRequest (request) {
  return {
    route: request.route,
    params: request.params ? {...request.params} : {},
  }
}

/**
 * This function is meant to update the routing request by executing all the "onTheWay" handlers
 * found in the path of the request.
 * Typical use is to redirect, check authentication, set default params, etc.
 * @param {{routes}} router
 * @param {String[]} pathNodes
 * @param {String} currentNode
 * @param {{route: String, params: Object}} request
 * @returns {{route: String, params: Object}} Updated request
 */
export function traverse (router, pathNodes, currentNode, request) {
  const {routes} = router
  if (routes[currentNode]) {
    let segmentIndex = pathNodes.indexOf(currentNode)
    if (typeof routes[currentNode].onTheWay === 'function') {
      const onTheWayResult = routes[currentNode].onTheWay(router, copyRequest(request))
      if (onTheWayResult.params) {
        Object.assign(request.params, onTheWayResult.params)
      }
      // REDIRECT?
      if (typeof onTheWayResult.route === 'string' && onTheWayResult.route !== request.route) {
        const newPathNodes = splitPath(onTheWayResult.route)
        let newIndex = 0
        while (
          /**
           * We look for the point of intersection and continue from there.
           * If the old and new path have segments in common, we should not repeat the ones already done.
           *
           * eg: redirected from /private/object?{} to /private/object/details?{id: 1}
           * where /private/object sets a default id.
           * we do not want to reevaluate "/", "/private" and "/private/object"
           * but want to evaluate /private/object/details?{id: 1}
           */
          newPathNodes[newIndex] === pathNodes[newIndex] &&
          newIndex < newPathNodes.length && newIndex < pathNodes.length &&
          newIndex < segmentIndex) {
          newIndex++
        }
        request.route = onTheWayResult.route
        pathNodes = newPathNodes
        segmentIndex = newIndex // new current
      }
    }
    // NEXT?
    if (segmentIndex < pathNodes.length - 1) {
      return traverse(router, pathNodes, pathNodes[segmentIndex + 1], request)
    }
  }
  return request
}

/**
 * @class Router
 * Simple router
 */
export default class Router {
  route = '/'
  params = {}
  history = [{route: '/', params: {}}]
  eventHandlers = {
    nav: [],
  }

  static traverse = traverse
  static copyRequest = copyRequest
  static splitPath = splitPath

  /**
   * Navigate
   * @param {{route: String, params: Object}} request
   */
  goTo (request, goToOptions = {}) {
    const currentState = {
      route: this.route,
      params: this.params,
    }
    const currentRouteConfig = this.routes[currentState.route]

    // for dev it's easier to not provide empty params when calling goTo(), so we provide default here
    let updatedRequest = Router.copyRequest(request)

    const pathNodes = Router.splitPath(request.route)
    updatedRequest = Router.traverse(this, pathNodes, pathNodes[0], updatedRequest)

    const routeConfig = this.routes[updatedRequest.route]

    if (!routeConfig) {
      logger.warn('404 - Unknown route')
      // TODO route not found
    }

    if (routeConfig && routeConfig.beforeEnter) {
      routeConfig.beforeEnter(this, updatedRequest)
    }

    if (currentRouteConfig && currentRouteConfig.beforeLeave) {
      currentRouteConfig.beforeLeave(this, updatedRequest)
    }

    // From that point, the view is transitionning
    this.route = updatedRequest.route
    this.params = updatedRequest.params

    if (routeConfig && routeConfig.afterEnter) {
      routeConfig.afterEnter(this, currentState)
    }

    if (currentRouteConfig && currentRouteConfig.afterLeave) {
      currentRouteConfig.afterLeave(this, currentState)
    }

    if (goToOptions.goingBack) {
      this.history = this.history.slice(1)
    }
    else if (goToOptions.action === 'POP') {
      this.history = [updatedRequest].concat(this.history.slice(1))
    }
    else {
      this.history = [updatedRequest].concat(this.history)
    }

    if (this.eventHandlers.nav.length > 0) {
      this.eventHandlers.nav.forEach((handler) => handler(this, goToOptions))
    }
  }

  /**
   * Go to previous navigation request
   */
  goBack () {
    if (this.history.length > 1) {
      this.goTo(this.history[1], {action: 'POP', goingBack: true})
    }
  }

  set (prop, value) {
    this[prop] = value
  }

  on (eventName, handler) {
    if (eventName !== 'nav') {
      throw new Error(`unknown ${eventName} event`)
    }
    this.eventHandlers[eventName].push(handler)
  }

  off (eventName, handler) {
    if (eventName !== 'nav') {
      throw new Error(`unknown ${eventName} event`)
    }
    removeFromArray(this.eventHandlers[eventName], handler)
  }

  /**
   * Helps to check if some params match the current router state params
   * @param {*} params1
   * @param {*} params2
   * @returns {Boolean} true if params1 is a subset of params2
   */
  paramMatch (params1, params2) {
    return !Object.keys(params2).some(
      (key) => typeof params1[key] !== 'undefined' && params1[key] !== params2[key]
    )
  }

  /**
   * @param {Object} routes - List of routes: hooks, name, etc
   * @param {Object} options - options
   * @param {String} options.initialRoute - set the router initial route
   * @param {Object} options.initialParams - set the router initial route
   * @param {Object} options.app - anything you'd like to be able to access in the hooks
   * @param {Function} options.onNav - run every time the route is updated
   */
  constructor (routes = {}, options = {}) {
    this.routes = routes
    this.options = options
    this.route = options.initialRoute || '/'
    this.params = options.initialParams || {}
    this.history = [{route: this.route, params: this.params}]
    this.app = options.app
  }
}
