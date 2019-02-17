import Router, {splitPath, traverse, copyRequest} from './Router'

const testRoutes = {
  '/': {
    onTheWay: () => ({params: {root: 'passed'}}),
    beforeLeave: jest.fn(),
    afterLeave: jest.fn(),
    afterEnter: jest.fn(),
  },
  '/public': {
    beforeEnter: jest.fn(),
    afterEnter: jest.fn(),
    beforeLeave: jest.fn(),
    afterLeave: jest.fn(),
  },
  '/public/faq': {},
  '/private': {
    onTheWay: () => ({params: {auth: true}}),
    beforeEnter: jest.fn(),
    afterEnter: jest.fn(),
    beforeLeave: jest.fn(),
    afterLeave: jest.fn(),
  },
  '/private/mystuff': {
    onTheWay: () => ({params: {id: 1}, route: '/private/mystuff/details'}), // test redirect
    afterEnter: jest.fn(),
    beforeLeave: jest.fn(),
  },
  '/private/mystuff/details': {
    onTheWay: () => ({params: {details: 'ok'}}),
    beforeEnter: jest.fn(),
    afterEnter: jest.fn(),
    afterLeave: jest.fn(),
    beforeLeave: jest.fn(),
  },
}

describe('Router', () => {
  let router = new Router(testRoutes, {initialRoute: '/public'})
  beforeEach(() => {
    router = new Router(testRoutes, {initialRoute: '/public'})
  })

  describe('initial state', () => {
    it('should have "/" (empty) as default initial route', () => {
      router = new Router()
      expect(router.route).toBe('/')
    })

    it('should use the initial route given through the options', () => {
      const routerWithOptions = new Router(null, {initialRoute: '/public'})
      expect(routerWithOptions.route).toBe('/public')
    })

    it('should have no params by default', () => {
      expect(router.params).toEqual({})
    })

    it('should use the initial params given through the options', () => {
      const routerWithOptions = new Router(null, {initialParams: {id: 1}})
      expect(routerWithOptions.params).toEqual({id: 1})
    })
  })

  describe('splitPath()', () => {
    it('should split the path', () => {
      const testPath = '/private/mystuff/details'
      const expected = ['/', '/private', '/private/mystuff', '/private/mystuff/details']
      expect(splitPath(testPath)).toEqual(expected)
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

  describe('traverse()', () => {
    it('should update the request with onTheWay hook', () => {
      const testPath = '/private/mystuff'
      router.set('routes', testRoutes)
      const pathNodes = splitPath(testPath)
      const request = {route: '/private/mystuff', params: {}}
      expect(traverse(router, pathNodes, pathNodes[0], request)).toEqual({
        params: {id: 1, auth: true, details: 'ok', root: 'passed'},
        route: '/private/mystuff/details'
      })
    })
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
      const request = {route: '/my-cryptos', params: {id: 1}}
      const spy = jest.spyOn(Router, 'copyRequest')
      router.goTo(request)
      expect(spy).toHaveBeenCalledWith(request)
    })

    it('should use traverse to determine the final route and params', () => {
      const request = {route: '/private/mystuff'}
      const spy = jest.spyOn(Router, 'traverse')
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
      const initialRequest = {route: router.route, params: router.params}
      const newRequest = {route: '/public/faq', params: {random: 1}}
      const expectedNewRequest = {route: '/public/faq', params: {random: 1, root: 'passed'}}
      expect(router.history).toHaveLength(1)
      expect(router.history[0]).toEqual(initialRequest)
      router.goTo(newRequest)
      expect(router.history).toHaveLength(2)
      expect(router.history[0]).toEqual(expectedNewRequest)
      expect(router.history[1]).toEqual(initialRequest)
    })

    describe('navigation hooks', () => {
      it('should invoke ONLY the corresponding beforeEnter hook', () => {
        const request = {route: '/private/mystuff'}
        // @see the testRoutes config
        const expectedUpdatedRequest = {
          route: '/private/mystuff/details',
          params: {id: 1, auth: true, details: 'ok', root: 'passed'},
        }
        router.goTo(request)
        expect(testRoutes['/private'].beforeEnter).not.toHaveBeenCalled()
        expect(testRoutes['/private/mystuff/details'].beforeEnter)
          .toHaveBeenCalledWith(router, expectedUpdatedRequest)
      })

      it('should invoke ONLY the corresponding afterEnter hook', () => {
        // reminder: initial route in tests is /public
        // @see the testRoutes config
        const request = {route: '/private/mystuff'}
        const currentState = {
          route: '/public',
          params: {},
        }
        router.goTo(request)
        expect(testRoutes['/'].afterEnter).not.toHaveBeenCalled()
        expect(testRoutes['/private'].afterEnter).not.toHaveBeenCalled()
        expect(testRoutes['/private/mystuff'].afterEnter).not.toHaveBeenCalled()
        expect(testRoutes['/private/mystuff/details'].afterEnter)
          .toHaveBeenCalledWith(router, currentState)
      })

      it('should invoke ONLY the corresponding beforeLeave hook', () => {
        // reminder: initial route in tests is /public
        // @see the testRoutes config
        const request = {route: '/private/mystuff'}
        const expectedUpdatedRequest = {
          route: '/private/mystuff/details',
          params: {id: 1, auth: true, details: 'ok', root: 'passed'},
        }
        router.goTo(request)
        expect(testRoutes['/'].beforeLeave).not.toHaveBeenCalled()
        expect(testRoutes['/private'].beforeLeave).not.toHaveBeenCalled()
        expect(testRoutes['/private/mystuff'].beforeLeave).not.toHaveBeenCalled()
        expect(testRoutes['/public'].beforeLeave)
          .toHaveBeenCalledWith(router, expectedUpdatedRequest)
      })

      it('should invoke ONLY the corresponding afterLeave hook', () => {
        // reminder: initial route in tests is /public
        // @see the testRoutes config
        const request = {route: '/private/mystuff'}
        const currentState = {
          route: '/public',
          params: {},
        }
        router.goTo(request)
        expect(testRoutes['/'].afterLeave).not.toHaveBeenCalled()
        expect(testRoutes['/private'].afterLeave).not.toHaveBeenCalled()
        expect(testRoutes['/public'].afterLeave)
          .toHaveBeenCalledWith(router, currentState)
      })
    })
  })

  describe('goBack()', () => {
    it('should update the history and go to the previous request', () => {
      router.goTo({route: '/public/faq'})
      router.goTo({route: '/private/mystuff'})
      expect(router.history).toHaveLength(3)
      router.goBack()
      expect(router.history).toHaveLength(2)
      expect(router.route).toEqual('/public/faq')
      expect(router.params).toEqual({root: 'passed'})
      expect(router.history[0]).toEqual({route: '/public/faq', params: {root: 'passed'}})
      expect(router.history[1]).toEqual({route: '/public', params: {}})
    })
  })
})
