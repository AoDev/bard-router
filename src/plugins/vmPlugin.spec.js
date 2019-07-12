import vmPlugin, {vmPluginInstantiateVM, vmPluginCleanupVM} from './vmPlugin'

class SomePageMockVM {
  destroyVM = jest.fn()
}

class OtherPageMockVM {
}

const routes = {
  '/': {
  },
  '/some-page': {
    vmPlugin: {
      vmClass: SomePageMockVM,
    },
  },
  '/some-other-page': {
    vmPlugin: {
      vmClass: OtherPageMockVM,
    },
  },
}

class RouterMock {
  route = '/'
  params = {}
  on = jest.fn()
  off = jest.fn()
  routes = routes

  app = {
    rootStore: {}
  }

  goTo = jest.fn().mockImplementation((request) => {
    this.route = request.route
    this.params = request.params
  })
}

describe('vmPlugin', () => {
  let routerMock
  let unregister

  beforeEach(() => {
    routerMock = new RouterMock(routes)
    unregister = vmPlugin.register(routerMock)
  })

  describe('register', () => {
    it('should register vmPluginInstantiateVM / vmPluginCleanupVM event listeners', () => {
      // Before nav
      const spyArgsBeforeNav = routerMock.on.mock.calls[0]
      expect(spyArgsBeforeNav[0]).toBe('beforeNav')
      expect(spyArgsBeforeNav[1]).toBe(vmPluginInstantiateVM)
      // After nav
      const spyArgsAfterNav = routerMock.on.mock.calls[1]
      expect(spyArgsAfterNav[0]).toBe('afterNav')
      expect(spyArgsAfterNav[1]).toBe(vmPluginCleanupVM)
    })

    it('should return a function to unregister the plugin', () => {
      expect(unregister).toBeInstanceOf(Function)
    })

    it('should decorate the router with the vmTree', () => {
      const routerMock = new RouterMock()
      expect(routerMock.vmPlugin).toBeUndefined()
      vmPlugin.register(routerMock)
      expect(routerMock.vmPlugin.vmTree).toBeDefined()
    })
  })

  describe('unregister', () => {
    it('should remove the event handlers & vmTree', () => {
      expect(routerMock.vmPlugin.vmTree).toBeDefined()
      unregister()
      expect(routerMock.vmPlugin).toBeUndefined()

      // Before nav
      const spyArgsBeforeNav = routerMock.off.mock.calls[0]
      expect(spyArgsBeforeNav[0]).toBe('beforeNav')
      expect(spyArgsBeforeNav[1]).toBe(vmPluginInstantiateVM)
      // After nav
      const spyArgsAfterNav = routerMock.off.mock.calls[1]
      expect(spyArgsAfterNav[0]).toBe('afterNav')
      expect(spyArgsAfterNav[1]).toBe(vmPluginCleanupVM)
    })
  })

  describe('vmPluginInstantiateVM', () => {
    it('should instantiate the corresponding VMs', () => {
      vmPluginInstantiateVM({
        router: routerMock, incomingRequest: {route: '/some-page'}, currentState: {route: '/'}
      })
      expect(routerMock.vmPlugin.vmTree['/some-page']).toBeInstanceOf(routes['/some-page'].vmPlugin.vmClass)
    })
  })

  describe('vmPluginCleanupVM', () => {
    it('should cleanup VMs', () => {
      vmPluginInstantiateVM({
        router: routerMock, incomingRequest: {route: '/some-page'}, currentState: {route: '/'}
      })
      vmPluginCleanupVM({
        router: routerMock, incomingRequest: {route: '/some-other-page'}, currentState: {route: '/some-page'}
      })
      expect(routerMock.vmPlugin.vmTree['/some-page'].destroyVM).toHaveBeenCalled()
    })
  })
})
