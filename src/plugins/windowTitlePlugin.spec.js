import windowTitlePlugin from './windowTitlePlugin'
import Router from '../Router'

const titleSpy = jest.fn()

const routes = {
  '/': {
    data: {
      title: 'Root',
    },
  },
  '/some-page': {
    data: {
      title: 'Some page',
    },
  },
  '/some-other-page': {
    data: {
      title (router) {
        titleSpy(router)
        return 'Some other page'
      }
    },
  },
}

class RouterMock {
  _setWindowTitleFromRouter = jest.fn()
  on = jest.fn()
  off = jest.fn()
}

describe('WindowTitlePlugin', () => {
  let router

  beforeAll(() => {
    // mock window
    global.window = {
      document: {
        title: '',
      },
    }
  })

  afterAll(() => {
    global.window = undefined
  })

  beforeEach(() => {
    router = new Router({routes, initialRequest: {route: '/'}})
    windowTitlePlugin.register(router)
  })

  describe('register', () => {
    it('should return a function to unregister the plugin', () => {
      const unregister = windowTitlePlugin.register(router)
      expect(unregister).toBeInstanceOf(Function)
    })

    test('the unregister function should remove the handler from the router listeners', () => {
      const routerMock = new RouterMock()
      const unregister = windowTitlePlugin.register(routerMock)
      unregister()
      const spyArgs = routerMock.off.mock.calls[0]
      expect(spyArgs[0]).toBe('nav')
      // fragile way to test that it passed the right handler
      expect(spyArgs[1].name.endsWith('setWindowTitleFromRouter')).toBe(true)
    })
  })

  describe('when title is a string', () => {
    it('should set the window title with the string', () => {
      router.goTo({route: '/'})
      expect(window.document.title).toBe('Root')
      router.goTo({route: '/some-page'})
      expect(window.document.title).toBe('Some page')
    })
  })
  describe('when title is a function', () => {
    it('should set the window title by calling the function', () => {
      router.goTo({route: '/some-other-page'})
      expect(titleSpy).toHaveBeenCalledWith(router)
      expect(window.document.title).toBe('Some other page')
    })
  })
})
