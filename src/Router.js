const logger = console

/**
 * @param {Array} array
 * @param {*} value
 * @returns {boolean} true if value is in array
 */
function includes (array, value) {
  return array.indexOf(value) > -1
}

/**
 * @param {Array} array
 * @param {*} value
 */
function removeFromArray (array, value) {
  const index = array.indexOf(value)
  if (index === -1) {
    return array
  }
  return array.slice(0, index).concat(array.slice(index + 1))
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

/**
 * @class Router
 * Simple router
 */
export default class Router {
  route = '/'
  params = {}
  story = []
  eventHandlers = {
    beforeNav: [],
    afterNav: [],
  }

  static routerEvents = ['beforeNav', 'afterNav']

  /**
   * Clone a request object.
   * for devs it's easier to not provide empty params when calling goTo(), so we provide default here
   * - Route is copied as is.
   * - Params first level props will be cloned.
   *   It is expected that params are only one level deep.
   * @param {Object} request
   * @param {String} request.route
   * @param {Object} request.params
   */
  static copyRequest (request) {
    return {
      route: request.route,
      params: request.params ? {...request.params} : {},
    }
  }

  /**
   * Update the internal history of the router
   * @param {Array.<{route: string, params: {}}>} story
   * @param {{route: string, params: {}}} request
   * @param {{action: string}} goToOptions
   */
  static updateStory (story, request, goToOptions) {
    if (goToOptions.goingBack) {
      return story.slice(1)
    }
    if (goToOptions.action === 'POP') {
      return [request].concat(story.slice(1))
    }
    return [request].concat(story)
  }

  /**
   * This function is meant to update the routing request by executing all the "intercept" handlers
   * found in the path of the request.
   * Typical use is to redirect, check authentication, set default params, etc.
   * @param {{routes}} router
   * @param {{route: String, params: Object}} request
   * @returns {{route: String, params: Object}} Updated request
   */
  static runInterceptors (router, request) {
    const {routes} = router
    let updatedRequest = Router.copyRequest(request)
    let segments = splitPath(request.route)

    while (segments.length > 0) {
      const routeConfig = routes[segments[0]]

      if (!routeConfig) {
        return updatedRequest
      }

      segments = segments.slice(1)

      const interceptor = routeConfig.onTheWay || routeConfig.intercept // TODO: remove in next version
      if (typeof interceptor === 'function') {
        /**
         * Copy the request before passing it to the interceptor to avoid trouble when user modifies it.
         */
        const interceptorReq = interceptor(router, Router.copyRequest(updatedRequest))
        if (interceptorReq.params) {
          Object.assign(updatedRequest.params, interceptorReq.params)
        }
        /**
         * In case of redirect, we look for the point of intersection and continue from there.
         * If the old and new path have segments in common, we should not repeat the ones already done.
         */
        if (typeof interceptorReq.route === 'string' && interceptorReq.route !== updatedRequest.route) {
          segments = diffPaths(splitPath(updatedRequest.route), splitPath(interceptorReq.route))
          updatedRequest.route = interceptorReq.route
        }
      }
    }
    return updatedRequest
  }

  /**
   * Return the redirection request to "not found" based on options
   * @param {*} routes
   * @param {{routeNotFound: string}} options
   */
  static redirectNotFound (routes, options) {
    if (options.routeNotFound) {
      if (!routes[options.routeNotFound]) {
        // Prevent an infinite loop
        throw new Error(`No corresponding route to "routeNotFound". Got ${options.routeNotFound}`)
      }
      return {route: options.routeNotFound, params: {}}
    }
    else {
      logger.warn('404 - route not found. Consider routeNotFound option.')
      return {route: '/', params: {}}
    }
  }

  /**
   * Process a navigation request
   * @param {{route: String, params: Object}} request
   * @param {{goingBack: boolean, action: string}?} goToOptions
   */
  goTo (request, goToOptions = {}) {
    let routerHookArgs
    const currentState = {
      route: this.route,
      params: this.params,
    }

    const currentRouteConfig = this.routes[currentState.route]
    let updatedRequest = Router.runInterceptors(this, request)

    let routeConfig = this.routes[updatedRequest.route]

    if (!routeConfig) {
      updatedRequest = Router.redirectNotFound(this.routes, this.options)
      routeConfig = this.routes[updatedRequest.route]
    }

    if (this.eventHandlers.afterNav.length > 0 || this.eventHandlers.beforeNav.length > 0) {
      routerHookArgs = {router: this, incomingRequest: updatedRequest, currentState, goToOptions}
    }

    if (this.eventHandlers.beforeNav.length > 0) {
      this.eventHandlers.beforeNav.forEach((handler) => handler(routerHookArgs))
    }

    if (routeConfig.beforeEnter) {
      routeConfig.beforeEnter(this, updatedRequest)
    }

    if (currentRouteConfig.beforeLeave && this.story.length > 0) {
      currentRouteConfig.beforeLeave(this, updatedRequest)
    }

    // From that point, the view is transitionning
    this.route = updatedRequest.route
    this.params = updatedRequest.params

    if (routeConfig.afterEnter) {
      routeConfig.afterEnter(this, currentState)
    }

    if (currentRouteConfig.afterLeave && this.story.length > 0) {
      currentRouteConfig.afterLeave(this, currentState)
    }

    this.story = Router.updateStory(this.story, updatedRequest, goToOptions)

    if (this.eventHandlers.afterNav.length > 0) {
      this.eventHandlers.afterNav.forEach((handler) => handler(routerHookArgs))
    }

    return updatedRequest
  }

  /**
   * Go to previous navigation request
   */
  goBack () {
    if (this.story.length > 1) {
      this.goTo(this.story[1], {action: 'POP', goingBack: true})
    }
  }

  set (prop, value) {
    this[prop] = value
  }

  /**
   * Attach router hook.
   * @param {[beforeNav', 'afterNav']} eventName
   * @param {Function} handler - called as: handler(router, goToOptions)
   */
  on (eventName, handler) {
    if (!includes(Router.routerEvents, eventName)) {
      throw new Error(`invalid "${eventName}" event`)
    }
    this.eventHandlers[eventName].push(handler)
  }

  /**
   * Remove router hook.
   * @param {['beforeNav', 'afterNav']} eventName
   * @param {Function} handler - Anonymous functions can not be removed
   */
  off (eventName, handler) {
    if (!includes(Router.routerEvents, eventName)) {
      throw new Error(`invalid "${eventName}" event`)
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
   * @param {Object} options - options
   * @param {Object} options.routes - List of routes: hooks, name, etc
   * @param {Object} options.app - anything you'd like to be able to access in the hooks
   * @param {String} options.routeNotFound - path to a route that should handle "not found" cases
   */
  constructor (options = {}) {
    this.routes = options.routes || {}
    this.options = options
    this.app = options.app
    this.goBack = this.goBack.bind(this)
    this.goTo = this.goTo.bind(this)
  }
}
