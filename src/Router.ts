import {includes, removeFromArray, splitPath, diffPaths} from './utils'
import * as mobx from 'mobx'

export type RouteParam = Record<string, string | number>

export interface IRequest {
  route: string
  params: RouteParam
}

interface IGoToOptions {
  goingBack?: boolean
  action?: string
}

type RouteNavHook = (request: IRequest, router: Router) => void

type RouterHookArgs = {
  router: Router
  incomingRequest: IRequest
  currentState: IRequest
  goToOptions: IGoToOptions
}

type routerNavHookHandler = (args: RouterHookArgs) => void

export interface IRouteConfig {
  beforeEnter?: RouteNavHook
  afterEnter?: RouteNavHook
  beforeLeave?: RouteNavHook
  afterLeave?: RouteNavHook
  intercept?: (request: IRequest, router: Router) => Partial<IRequest>
  windowTitlePlugin?: string | ((router: Router) => string)
}

interface IRouterOptions {
  routeNotFound?: string
  routes?: Record<string, IRouteConfig>
}

export interface IBardRouter {
  routes: Record<string, IRouteConfig>
  route: string
  params: RouteParam
  story: IRequest[]
  options: IRouterOptions
  eventHandlers: {beforeNav: routerNavHookHandler[]; afterNav: routerNavHookHandler[]}
}

export default class Router implements IBardRouter {
  routes: Record<string, IRouteConfig>
  route = '/'
  params: Record<string, string | number> = {}
  story: IRequest[] = []
  options: IRouterOptions
  eventHandlers: {beforeNav: routerNavHookHandler[]; afterNav: routerNavHookHandler[]} = {
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
   */
  static runInterceptors(router: Router, request: IRequest) {
    const {routes} = router
    const requestCopy = Router.copyRequest(request)
    let segments = splitPath(request.route)

    while (segments.length > 0) {
      const currentSegment = segments[0]
      const routeConfig = routes[currentSegment]
      segments = segments.slice(1)

      const interceptor = routeConfig?.intercept

      if (typeof interceptor === 'function') {
        // Copy the request before passing it to the interceptor to avoid trouble when user modifies it.
        const updatedReq = interceptor(Router.copyRequest(requestCopy), router)
        if (updatedReq.params) {
          Object.assign(requestCopy.params, updatedReq.params)
        }
        // In case of redirect, we look for the point of intersection and continue from there.
        // If the old and new path have segments in common, we should not repeat the ones already done.
        if (typeof updatedReq.route === 'string' && updatedReq.route !== requestCopy.route) {
          segments = diffPaths(splitPath(currentSegment), splitPath(updatedReq.route))
          requestCopy.route = updatedReq.route
        }
      }
    }
    return requestCopy
  }

  get currentRouteConfig() {
    return this.routes[this.route]
  }

  /**
   * Process a navigation request
   */
  goTo(route: string, params = {}, goToOptions: IGoToOptions = {}) {
    const currentState = {route: this.route, params: this.params}
    const request: IRequest = {route, params}
    const currentRouteConfig: IRouteConfig | null = this.routes[currentState.route] || null
    const updatedRequest = Router.runInterceptors(this, request)
    const routeConfig: IRouteConfig | null = updatedRequest.route
      ? this.routes[updatedRequest.route]
      : null

    let routerHookArgs: RouterHookArgs

    if (this.eventHandlers.afterNav.length > 0 || this.eventHandlers.beforeNav.length > 0) {
      routerHookArgs = {router: this, incomingRequest: updatedRequest, currentState, goToOptions}
    }

    if (this.eventHandlers.beforeNav.length > 0) {
      this.eventHandlers.beforeNav.forEach((handler) => handler(routerHookArgs))
    }

    routeConfig?.beforeEnter?.(updatedRequest, this)

    if (this.story.length > 0) {
      currentRouteConfig?.beforeLeave?.(updatedRequest, this)
    }

    // From that point, the view is transitionning
    this.route = updatedRequest.route
    this.params = updatedRequest.params

    routeConfig?.afterEnter?.(currentState, this)

    if (this.story.length > 0) {
      currentRouteConfig?.afterLeave?.(currentState, this)
    }

    this.story = Router.updateStory(this.story, updatedRequest, goToOptions)

    this.eventHandlers.afterNav.forEach((handler) => handler(routerHookArgs))

    return updatedRequest
  }

  /**
   * Go to previous navigation request
   */
  goBack() {
    if (this.story.length > 1) {
      const {route, params} = this.story[1]
      this.goTo(route, params, {action: 'POP', goingBack: true})
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
    if (!includes(Router.routerEvents, eventName)) {
      throw new Error(`invalid "${eventName}" event`)
    }
    removeFromArray(this.eventHandlers[eventName], handler)
  }

  /**
   * Helps to check if some params match the current router state params
   * @returns `true` if params1 is a subset of params2
   */
  paramMatch(params1: RouteParam, params2: RouteParam) {
    return !Object.keys(params2).some(
      (key) => typeof params1[key] !== 'undefined' && params1[key] !== params2[key]
    )
  }

  /**
   * @param options.routes - List of routes: hooks, name, etc
   * @param options.routeNotFound - path to a route that should handle "not found" cases
   */
  constructor(options: IRouterOptions = {}) {
    this.routes = options.routes || {}
    this.options = options
    this.eventHandlers = {beforeNav: [], afterNav: []}
    mobx.makeObservable(this, {
      currentRouteConfig: mobx.computed,
      goBack: mobx.action.bound,
      goTo: mobx.action.bound,
      params: mobx.observable.ref,
      route: mobx.observable,
      story: mobx.observable.ref,
    })
  }
}
