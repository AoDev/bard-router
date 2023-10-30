import scrollPlugin from '../../src/plugins/scrollPlugin'
import Router from '../../src/Router'
import RouterMock from '../RouterMock'

const windowMock = {
  scrollTo: jest.fn(),
}

const testRoutes = {
  '/': {},
  '/page': {},
}

describe('scrollPlugin', () => {
  describe('register', () => {
    it('should add the event handlers', () => {
      const routerMock = new RouterMock()
      scrollPlugin.register(routerMock, windowMock)
      const spyArgs = routerMock.on.mock.calls[0]
      expect(spyArgs[0]).toBe('afterNav')
      expect(spyArgs[1].name.endsWith('scrollPluginHandler')).toBe(true)
    })

    it('should return a disposer function', () => {
      const routerMock = new RouterMock()
      const unregister = scrollPlugin.register(routerMock, windowMock)
      unregister()
      const spyArgs = routerMock.off.mock.calls[0]
      expect(spyArgs[0]).toBe('afterNav')
      expect(spyArgs[1].name.endsWith('scrollPluginHandler')).toBe(true)
    })
  })

  describe('when navigating', () => {
    test('the router should call the scroll method', () => {
      const router = new Router({routes: testRoutes})
      scrollPlugin.register(router, windowMock)
      router.goTo('/page')
      expect(windowMock.scrollTo).toHaveBeenCalledWith(0, 0)
    })
  })
})
