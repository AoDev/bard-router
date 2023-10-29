import Router, {IRouteConfig} from './Router'
const {runInterceptors, copyRequest} = Router

const testRoutes: Record<string, IRouteConfig> = {
  '/': {
    intercept: () => ({params: {root: 'passed'}}),
    beforeEnter: jest.fn(),
    beforeLeave: jest.fn(),
    afterEnter: jest.fn(),
    afterLeave: jest.fn(),
  },
  '/public': {
    beforeEnter: jest.fn(),
    beforeLeave: jest.fn(),
    afterEnter: jest.fn(),
    afterLeave: jest.fn(),
  },
  '/public/faq': {
    beforeEnter: jest.fn(),
    beforeLeave: jest.fn(),
    afterEnter: jest.fn(),
    afterLeave: jest.fn(),
  },
  '/private': {
    beforeEnter: jest.fn(),
    beforeLeave: jest.fn(),
    afterEnter: jest.fn(),
    afterLeave: jest.fn(),
  },
  '/private/mystuff': {
    intercept: () => ({route: '/private/mystuff/details', params: {id: 1}}), // test redirect
    beforeEnter: jest.fn(),
    beforeLeave: jest.fn(),
    afterEnter: jest.fn(),
    afterLeave: jest.fn(),
  },
  '/private/mystuff/details': {
    intercept: () => ({params: {details: 'ok'}}),
    beforeEnter: jest.fn(),
    beforeLeave: jest.fn(),
    afterEnter: jest.fn(),
    afterLeave: jest.fn(),
  },
}

describe('Router', () => {
  let router = new Router({routes: testRoutes})

  beforeEach(() => {
    router = new Router({routes: testRoutes})
  })

  describe('initial state', () => {
    it('should use root "/" and empty params as default for initial request', () => {
      expect(router.route).toBe('/')
      expect(router.params).toEqual({})
    })
  })

  describe('paramMatch()', () => {
    it('should compare params', () => {
      expect(router.paramMatch({}, {})).toBe(true)
      expect(router.paramMatch({id: 1}, {})).toBe(true)
      expect(router.paramMatch({}, {id: 1})).toBe(true)
      expect(router.paramMatch({id: 1}, {id: 1, name: 'John'})).toBe(true)
      expect(router.paramMatch({id: 1}, {id: 2})).toBe(false)
    })
  })

  describe('runInterceptors()', () => {
    it('should work with only root request', () => {
      const to = {route: '/', params: {}}
      router.routes = testRoutes
      expect(runInterceptors(router, to)).toEqual({
        params: {root: 'passed'},
        route: '/',
      })
    })

    it('should update the request with intercept hook', () => {
      const to = {route: '/private/mystuff', params: {}}
      expect(runInterceptors(router, to)).toEqual({
        params: {id: 1, details: 'ok', root: 'passed'},
        route: '/private/mystuff/details',
      })
    })

    it('should handle complex redirect situation', () => {
      // This is a test case that models an actual router bug
      // where runInterceptor was wrongly skipping some paths.
      const routes = {
        '/': {},
        '/a': {},
        '/a/b': {
          intercept: jest.fn().mockImplementation(() => ({route: '/a/b/c/d', params: {}})),
        },
        '/a/b/c': {
          intercept: jest.fn().mockImplementation((request) => request),
        },
        '/a/b/c/d': {
          intercept: jest.fn().mockImplementation((request) => request),
        },
      }
      router.routes = routes
      runInterceptors(router, {route: '/a/b/c', params: {}})
      expect(routes['/a/b'].intercept).toHaveBeenCalled()
      expect(routes['/a/b/c'].intercept).toHaveBeenCalled()
      expect(routes['/a/b/c/d'].intercept).toHaveBeenCalled()
    })

    test.todo('must pass a COPY of the request to the user interceptor')
  })

  describe('copyRequest()', () => {
    it('should shallow copy the request', () => {
      const testRequest = {route: '/private/mystuff', params: {id: 1}}
      const copiedRequest = copyRequest(testRequest)
      expect(copiedRequest).not.toBe(testRequest)
      expect(copiedRequest.route).toBe(testRequest.route)
      expect(copiedRequest.params).not.toBe(testRequest.params)
      expect(copiedRequest.params).toEqual(testRequest.params)
    })
  })

  describe('goTo()', () => {
    it('should not modify the original request object', () => {
      const params = {id: 1}
      router.goTo('/private/mystuff', params)
      expect(params).toBe(params)
      expect(params).toEqual({id: 1})
    })

    it('should use runInterceptors to determine the final route and params', () => {
      const spy = jest.spyOn(Router, 'runInterceptors')
      router.goTo('/private/mystuff')
      expect(spy).toHaveBeenCalled()
    })

    it('should update its state with the expected request route and params', () => {
      // @see the testRoutes config
      const expectedState = {
        route: '/private/mystuff/details',
        params: {id: 1, details: 'ok', root: 'passed'},
      }
      router.goTo('/private/mystuff')
      expect(router.route).toBe(expectedState.route)
      expect(router.params).toEqual(expectedState.params)
    })

    it('should add an entry in history', () => {
      // @see the testRoutes config
      const expectedInitialRequest = {route: '/public', params: {root: 'passed'}}
      const expectedNewRequest = {route: '/public/faq', params: {random: 1, root: 'passed'}}
      router.goTo('/public')
      expect(router.story).toHaveLength(1)
      expect(router.story[0]).toEqual(expectedInitialRequest)
      router.goTo('/public/faq', {random: 1})
      expect(router.story).toHaveLength(2)
      expect(router.story[0]).toEqual(expectedNewRequest)
      expect(router.story[1]).toEqual(expectedInitialRequest)
    })

    describe('navigation hooks', () => {
      test('none of them should have been triggered when router is instantiated', () => {
        Object.keys(testRoutes).forEach((key) => {
          const routeConfig = testRoutes[key]
          expect(routeConfig.beforeEnter).not.toHaveBeenCalled()
          expect(routeConfig.beforeLeave).not.toHaveBeenCalled()
          expect(routeConfig.afterEnter).not.toHaveBeenCalled()
          expect(routeConfig.afterLeave).not.toHaveBeenCalled()
        })
      })

      describe('- on first request', () => {
        it('should trigger only the beforeEnter and afterEnter of the corresponding route', () => {
          const expectedUpdatedRequest = {
            // @see the testRoutes config
            route: '/private/mystuff/details',
            params: {id: 1, details: 'ok', root: 'passed'},
          }
          router.goTo('/private/mystuff')
          Object.keys(testRoutes).forEach((key) => {
            const routeConfig = testRoutes[key]
            if (key !== expectedUpdatedRequest.route) {
              expect(routeConfig.beforeEnter).not.toHaveBeenCalled()
              expect(routeConfig.beforeLeave).not.toHaveBeenCalled()
              expect(routeConfig.afterEnter).not.toHaveBeenCalled()
              expect(routeConfig.afterLeave).not.toHaveBeenCalled()
            } else {
              expect(routeConfig.beforeEnter).toHaveBeenCalledWith(expectedUpdatedRequest, router)
              expect(routeConfig.beforeLeave).not.toHaveBeenCalled()
              expect(routeConfig.afterEnter).toHaveBeenCalled()
              if (routeConfig.afterEnter) {
                // @ts-expect-error TS does not know that jest mocks are provided as hooks
                const afterEnterArgs = routeConfig.afterEnter.mock.calls[0]
                expect(afterEnterArgs[1]).toBe(router)
              }
              expect(routeConfig.afterLeave).not.toHaveBeenCalled()
            }
          })
        })
      })

      describe('- on subsequent requests', () => {
        it('should trigger the right corresponding hooks', () => {
          const initialRequest = {route: '/public', params: {}}
          router.goTo('/public')
          jest.resetAllMocks()
          const newRequest = {route: '/private/mystuff/details', params: {id: 1}}
          router.goTo(newRequest.route, newRequest.params)
          Object.keys(testRoutes).forEach((key) => {
            const routeConfig = testRoutes[key]
            if (key !== initialRequest.route && key !== newRequest.route) {
              expect(routeConfig.beforeEnter).not.toHaveBeenCalled()
              expect(routeConfig.beforeLeave).not.toHaveBeenCalled()
              expect(routeConfig.afterEnter).not.toHaveBeenCalled()
              expect(routeConfig.afterLeave).not.toHaveBeenCalled()
            } else if (key === initialRequest.route) {
              expect(routeConfig.beforeLeave).toHaveBeenCalled()
              expect(routeConfig.afterLeave).toHaveBeenCalled()
              expect(routeConfig.beforeEnter).not.toHaveBeenCalled()
              expect(routeConfig.afterEnter).not.toHaveBeenCalled()
            } else if (key === newRequest.route) {
              expect(routeConfig.beforeLeave).not.toHaveBeenCalled()
              expect(routeConfig.afterLeave).not.toHaveBeenCalled()
              expect(routeConfig.beforeEnter).toHaveBeenCalled()
              expect(routeConfig.afterEnter).toHaveBeenCalled()
            }
          })
        })
      })
    })
  })

  describe('goBack()', () => {
    it('should update the history and go to the previous request', () => {
      router.goTo('/public/faq')
      router.goTo('/private/mystuff')
      expect(router.story).toHaveLength(2)
      router.goBack()
      expect(router.story).toHaveLength(1)
      expect(router.route).toEqual('/public/faq')
      expect(router.params).toEqual({root: 'passed'})
      expect(router.story[0]).toEqual({route: '/public/faq', params: {root: 'passed'}})
    })
  })
})
