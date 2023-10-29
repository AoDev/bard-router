import windowTitlePlugin from './windowTitlePlugin'
import Router, {IRouteConfig} from '../Router'
import RouterMock from '../../test/RouterMock'

const titleSpy = jest.fn()

const routes: Record<string, IRouteConfig> = {
  '/': {
    windowTitlePlugin: 'Root',
  },
  '/some-page': {
    windowTitlePlugin: 'Some page',
  },
  '/some-other-page': {
    windowTitlePlugin: (router: Router) => {
      titleSpy(router)
      return 'Some other page'
    },
  },
}

describe('WindowTitlePlugin', () => {
  let router: Router
  let windowMock = {document: {title: ''}}

  beforeEach(() => {
    router = new Router({routes})
    windowMock = {document: {title: ''}}
    windowTitlePlugin.register(router, windowMock)
  })

  describe('register', () => {
    it('should return a function to unregister the plugin', () => {
      const unregister = windowTitlePlugin.register(router, windowMock)
      expect(unregister).toBeInstanceOf(Function)
    })

    test('the unregister function should remove the handler from the router listeners', () => {
      const routerMock = new RouterMock()
      const unregister = windowTitlePlugin.register(routerMock, windowMock)
      unregister()
      const spyArgs = routerMock.off.mock.calls[0]
      expect(spyArgs[0]).toBe('afterNav')
      // fragile way to test that it passed the right handler
      expect(spyArgs[1].name.endsWith('setWindowTitleFromRouter')).toBe(true)
    })
  })

  describe('when title is a string', () => {
    it('should set the window title with the string', () => {
      router.goTo('/')
      expect(windowMock.document.title).toBe('Root')
      router.goTo('/some-page')
      expect(windowMock.document.title).toBe('Some page')
    })
  })

  describe('when title is a function', () => {
    it('should set the window title by calling the function', () => {
      router.goTo('/some-other-page')
      expect(titleSpy).toHaveBeenCalledWith(router)
      expect(windowMock.document.title).toBe('Some other page')
    })
  })
})
