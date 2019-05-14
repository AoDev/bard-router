import Router, {splitPath, diffPaths} from './Router'
const {runInterceptors, copyRequest} = Router

const testRoutes = {
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
    intercept: () => ({params: {auth: true}}),
    beforeEnter: jest.fn(),
    beforeLeave: jest.fn(),
    afterEnter: jest.fn(),
    afterLeave: jest.fn(),
  },
  '/private/mystuff': {
    intercept: () => ({params: {id: 1}, route: '/private/mystuff/details'}), // test redirect
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

describe.only('Router', () => {
  let router
  beforeEach(() => {
    router = new Router({routes: testRoutes, initialRequest: {route: '/public'}})
  })

  describe('initial state', () => {
    it('should use root "/" and empty params as default for initial request', () => {
      router = new Router()
      expect(router.route).toBe('/')
      expect(router.params).toEqual({})
    })
  })

  describe('splitPath()', () => {
    it('should split the path', () => {
      const testPath = '/private/mystuff/details'
      const expected = ['/', '/private', '/private/mystuff', '/private/mystuff/details']
      expect(splitPath(testPath)).toEqual(expected)
    })

    it('should split correctly when it is only the root request', () => {
      // This test is there because a bug was found and caused an infinite loop
      const testPath = '/'
      const expected = ['/']
      expect(splitPath(testPath)).toEqual(expected)
    })
  })

  describe('diffPaths', () => {
    it('should return the path difference', () => {
      const testPath1 = ['/', '/a', '/a/b', '/a/b/c']
      const testPath2 = ['/', '/a', '/a/y', '/a/y/z']
      const testPath3 = ['/']
      expect(diffPaths(testPath1, testPath2)).toEqual(['/a/y', '/a/y/z'])
      expect(diffPaths(testPath1, testPath3)).toEqual([])
      expect(diffPaths(testPath1, testPath1)).toEqual([])
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
      const to = {route: '/'}
      router.set('routes', testRoutes)
      expect(runInterceptors(router, to)).toEqual({
        params: {root: 'passed'},
        route: '/'
      })
    })

    it('should update the request with onTheWay hook', () => {
      const to = {route: '/private/mystuff', params: {}}
      router.set('routes', testRoutes)
      expect(runInterceptors(router, to)).toEqual({
        params: {id: 1, auth: true, details: 'ok', root: 'passed'},
        route: '/private/mystuff/details'
      })
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

  describe('on()', () => {
    it('should throw an error for invalid eventName', () => {
      const spyFn = jest.fn().mockImplementation(() => {
        router.on('wrong-event', () => {})
      })
      expect(spyFn).toThrowError('invalid "wrong-event" event')
    })
  })

  describe('off()', () => {
    it('should throw an error for invalid eventName', () => {
      const spyFn = jest.fn().mockImplementation(() => {
        router.off('wrong-event', () => {})
      })
      expect(spyFn).toThrowError('invalid "wrong-event" event')
    })
  })

  describe('goTo()', () => {
    it('should not modify the original request object', () => {
      const params = {id: 1}
      const request = {route: '/private/mystuff', params}
      router.goTo(request)
      expect(request.route).toBe('/private/mystuff')
      expect(request.params).toBe(params)
      expect(request.params).toEqual({id: 1})
    })

    it('should use runInterceptors to determine the final route and params', () => {
      const request = {route: '/private/mystuff'}
      const spy = jest.spyOn(Router, 'runInterceptors')
      router.goTo(request)
      expect(spy).toHaveBeenCalled()
    })

    it('should update its state with the expected request route and params', () => {
      const request = {route: '/private/mystuff'}
      // @see the testRoutes config
      const expectedState = {
        route: '/private/mystuff/details',
        params: {id: 1, auth: true, details: 'ok', root: 'passed'},
      }
      router.goTo(request)
      expect(router.route).toBe(expectedState.route)
      expect(router.params).toEqual(expectedState.params)
    })

    it('should add an entry in history', () => {
      // @see the testRoutes config
      const initialRequest = {route: '/public', params: {}}
      const expectedInitialRequest = {route: '/public', params: {root: 'passed'}}
      const newRequest = {route: '/public/faq', params: {random: 1}}
      const expectedNewRequest = {route: '/public/faq', params: {random: 1, root: 'passed'}}
      router.goTo(initialRequest)
      expect(router.story).toHaveLength(1)
      expect(router.story[0]).toEqual(expectedInitialRequest)
      router.goTo(newRequest)
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
          const request = {route: '/private/mystuff'}
          const expectedUpdatedRequest = {
            // @see the testRoutes config
            route: '/private/mystuff/details',
            params: {id: 1, auth: true, details: 'ok', root: 'passed'},
          }
          router.goTo(request)
          Object.keys(testRoutes).forEach((key) => {
            const routeConfig = testRoutes[key]
            if (key !== expectedUpdatedRequest.route) {
              expect(routeConfig.beforeEnter).not.toHaveBeenCalled()
              expect(routeConfig.beforeLeave).not.toHaveBeenCalled()
              expect(routeConfig.afterEnter).not.toHaveBeenCalled()
              expect(routeConfig.afterLeave).not.toHaveBeenCalled()
            }
            else {
              expect(routeConfig.beforeEnter).toHaveBeenCalledWith(router, expectedUpdatedRequest)
              expect(routeConfig.beforeLeave).not.toHaveBeenCalled()
              expect(routeConfig.afterEnter).toHaveBeenCalled()
              const afterEnterArgs = routeConfig.afterEnter.mock.calls[0]
              expect(afterEnterArgs[0]).toBe(router)
              expect(routeConfig.afterLeave).not.toHaveBeenCalled()
            }
          })
        })
      })

      describe('- on subsequent requests', () => {
        it('should trigger the right corresponding hooks', () => {
          const initialRequest = {route: '/public'}
          router.goTo(initialRequest)
          jest.resetAllMocks()
          const newRequest = {route: '/private/mystuff/details', params: {id: 1}}
          router.goTo(newRequest)
          Object.keys(testRoutes).forEach((key) => {
            const routeConfig = testRoutes[key]
            if (key !== initialRequest.route && key !== newRequest.route) {
              expect(routeConfig.beforeEnter).not.toHaveBeenCalled()
              expect(routeConfig.beforeLeave).not.toHaveBeenCalled()
              expect(routeConfig.afterEnter).not.toHaveBeenCalled()
              expect(routeConfig.afterLeave).not.toHaveBeenCalled()
            }
            else if (key === initialRequest.route) {
              expect(routeConfig.beforeLeave).toHaveBeenCalled()
              expect(routeConfig.afterLeave).toHaveBeenCalled()
              expect(routeConfig.beforeEnter).not.toHaveBeenCalled()
              expect(routeConfig.afterEnter).not.toHaveBeenCalled()
            }
            else if (key === newRequest.route) {
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
      router.goTo({route: '/public/faq'})
      router.goTo({route: '/private/mystuff'})
      expect(router.story).toHaveLength(2)
      router.goBack()
      expect(router.story).toHaveLength(1)
      expect(router.route).toEqual('/public/faq')
      expect(router.params).toEqual({root: 'passed'})
      expect(router.story[0]).toEqual({route: '/public/faq', params: {root: 'passed'}})
    })
  })
})
