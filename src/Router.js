const logger = console

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
 * Update the internal history of the router
 * @param {*} story
 * @param {*} request
 * @param {*} goToOptions
 */
function updateStory (story, request, goToOptions) {
  if (goToOptions.goingBack) {
    return story.slice(1)
  }
  if (goToOptions.action === 'POP') {
    return [request].concat(story.slice(1))
  }
  return [request].concat(story)
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

    let routeConfig = this.routes[updatedRequest.route]

    if (!routeConfig) {
      // TODO: should probable handle not found in the "traverse"
      if (this.options.routeNotFound) {
        if (!this.routes[this.options.routeNotFound]) {
          // Prevent an infinite loop
          throw new Error(`No corresponding route to "routeNotFound". Falling back to '/'. Got ${this.options.routeNotFound}`)
        }
        updatedRequest = {route: this.options.routeNotFound, params: {}}
        routeConfig = this.routes[updatedRequest.route]
      }
      else {
        logger.warn('404 - route not found. Consider routeNotFound option.')
        updatedRequest = {route: '/', params: {}}
        routeConfig = this.routes[updatedRequest.route]
      }
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

    this.story = updateStory(this.story, updatedRequest, goToOptions)

    if (this.eventHandlers.nav.length > 0) {
      this.eventHandlers.nav.forEach((handler) => handler(this, updatedRequest, goToOptions))
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
   * @param {String} eventName - Valid events: 'nav'
   * @param {Function} handler - Will be called like: handler(router, goToOptions)
   */
  on (eventName, handler) {
    if (eventName !== 'nav') {
      throw new Error(`unknown ${eventName} event`)
    }
    this.eventHandlers[eventName].push(handler)
  }

  /**
   * Remove router hook.
   * @param {String} eventName - Valid events: 'nav'
   * @param {Function} handler - Anonymous functions can not be removed
   */
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
