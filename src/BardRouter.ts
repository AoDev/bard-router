import {includes, removeFromArray, splitPath, diffPaths} from './utils'
import * as mobx from 'mobx'
const logger = console

type routeParam = {[key: string]: string | number}

export interface IRequest {
  route?: string
  params?: routeParam
}

interface IGoToOptions {
  goingBack?: boolean
  action?: string
}

type routeNavHook = (router: BardRouter, request: IRequest) => void

type routerNavHookArgs = {
  router: BardRouter
  incomingRequest: IRequest
  currentState: IRequest
  goToOptions: IGoToOptions
}

type routerNavHookHandler = (args: routerNavHookArgs) => void

interface IRouteConfig {
  beforeEnter?: routeNavHook
  afterEnter?: routeNavHook
  beforeLeave?: routeNavHook
  afterLeave?: routeNavHook
  intercept?: (router: BardRouter, request: IRequest) => IRequest
  vmPlugin?: {vmClass: any}
  windowTitlePlugin?: {title: string | ((router: BardRouter) => string)}
}

interface IRouteConfigDict {
  [name: string]: IRouteConfig
}

interface IRouterOptions {
  routeNotFound?: string
  routes?: IRouteConfigDict
  app?: any
}

export default class BardRouter {
  routes: {[name: string]: IRouteConfig}
  vmPlugin?: any
  route = '/'
  params = {}
  story: IRequest[] = []
  options: IRouterOptions
  eventHandlers: {beforeNav: routerNavHookHandler[]; afterNav: routerNavHookHandler[]} = {
    beforeNav: [],
    afterNav: [],
  }
  app: any

  static routerEvents = ['beforeNav', 'afterNav']

  /**
   * Clone a request object.
   * for devs it's easier to not provide empty params when calling goTo(), so we provide default here
   * - Route is copied as is.
   * - Params first level props will be cloned.
   *   It is expected that params are only one level deep.
   */
  static copyRequest(request: IRequest) {
    return {
      route: request.route,
      params: request.params ? {...request.params} : {},
    }
  }

  /**
   * Update the internal history of the router
   */
  static updateStory(story: IRequest[], request: IRequest, goToOptions: IGoToOptions) {
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
   * @param {BardRouter} router
   * @param {{route: String, params: Object}} request
   * @returns {{route: String, params: Object}} Updated request
   */
  static runInterceptors(router: BardRouter, request: IRequest) {
    const {routes} = router
    const requestCopy = BardRouter.copyRequest(request)
    let segments = splitPath(request.route)

    while (segments.length > 0) {
      const currentSegment = segments[0]
      const routeConfig = routes[currentSegment]

      if (!routeConfig) {
        return requestCopy
      }

      segments = segments.slice(1)

      const interceptor = routeConfig.intercept
      if (typeof interceptor === 'function') {
        /**
         * Copy the request before passing it to the interceptor to avoid trouble when user modifies it.
         */
        const interceptorReq = interceptor(router, BardRouter.copyRequest(requestCopy))
        if (interceptorReq.params) {
          Object.assign(requestCopy.params, interceptorReq.params)
        }
        /**
         * In case of redirect, we look for the point of intersection and continue from there.
         * If the old and new path have segments in common, we should not repeat the ones already done.
         */
        if (
          typeof interceptorReq.route === 'string' &&
          interceptorReq.route !== requestCopy.route
        ) {
          segments = diffPaths(splitPath(currentSegment), splitPath(interceptorReq.route))
          requestCopy.route = interceptorReq.route
        }
      }
    }
    return requestCopy
  }

  /**
   * Return the redirection request to "not found" based on options
   * @param {*} routes
   * @param {{routeNotFound: string}} options
   */
  static redirectNotFound(
    routes: IRouteConfigDict,
    options: IRouterOptions,
    routePathNotFound: string
  ) {
    if (options.routeNotFound) {
      if (!routes[options.routeNotFound]) {
        // Prevent an infinite loop
        throw new Error(`No corresponding route to "routeNotFound". Got ${options.routeNotFound}`)
      }
      return {route: options.routeNotFound, params: {}}
    } else {
      logger.warn(`404 - ${routePathNotFound} route not found. Consider routeNotFound option.`)
      return {route: '/', params: {}}
    }
  }

  get currentRouteConfig() {
    return this.routes[this.route]
  }

  /**
   * Process a navigation request
   */
  goTo(request: IRequest, goToOptions: IGoToOptions = {}) {
    let routerHookArgs: routerNavHookArgs

    const currentState = {
      route: this.route,
      params: this.params,
    }

    const currentRouteConfig = this.routes[currentState.route]
    let updatedRequest = BardRouter.runInterceptors(this, request)

    let routeConfig = this.routes[updatedRequest.route]

    if (!routeConfig) {
      updatedRequest = BardRouter.redirectNotFound(this.routes, this.options, updatedRequest.route)
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

    this.story = BardRouter.updateStory(this.story, updatedRequest, goToOptions)

    if (this.eventHandlers.afterNav.length > 0) {
      this.eventHandlers.afterNav.forEach((handler) => handler(routerHookArgs))
    }

    return updatedRequest
  }

  /**
   * Go to previous navigation request
   */
  goBack() {
    if (this.story.length > 1) {
      this.goTo(this.story[1], {action: 'POP', goingBack: true})
    }
  }

  /**
   * Attach router hook.
   * This hook runs for every route change
   */
  on(eventName: 'beforeNav' | 'afterNav', handler: routerNavHookHandler) {
    this.eventHandlers[eventName].push(handler)
  }

  /**
   * Remove router hook.
   * @param {['beforeNav', 'afterNav']} eventName
   * @param {Function} handler - Anonymous functions can not be removed
   */
  off(eventName: 'beforeNav' | 'afterNav', handler: routerNavHookHandler) {
    if (!includes(BardRouter.routerEvents, eventName)) {
      throw new Error(`invalid "${eventName}" event`)
    }
    removeFromArray(this.eventHandlers[eventName], handler)
  }

  /**
   * Helps to check if some params match the current router state params
   * @returns `true` if params1 is a subset of params2
   */
  paramMatch(params1: routeParam, params2: routeParam) {
    return !Object.keys(params2).some(
      (key) => typeof params1[key] !== 'undefined' && params1[key] !== params2[key]
    )
  }

  /**
   * @param options.routes - List of routes: hooks, name, etc
   * @param options.app - anything you'd like to be able to access in the hooks
   * @param options.routeNotFound - path to a route that should handle "not found" cases
   */
  constructor(options: IRouterOptions = {}) {
    this.routes = options.routes || {}
    this.options = options
    this.app = options.app
    this.eventHandlers = {beforeNav: [], afterNav: []}
    mobx.makeObservable(this, {
      story: mobx.observable.ref,
      route: mobx.observable,
      params: mobx.observable.ref,
      goTo: mobx.action.bound,
      currentRouteConfig: mobx.computed,
    })
  }
}
