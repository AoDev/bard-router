import {IBardRouter} from '../src/Router'

export default class RouterMock implements IBardRouter {
  currentRouteConfig = {}
  eventHandlers = {beforeNav: [] as any[], afterNav: [] as any[]}
  goBack = jest.fn()
  goTo = jest.fn()
  off = jest.fn()
  on = jest.fn()
  onAfterNav: any[] = []
  onBeforeNav: any[] = []
  options = {}
  paramMatch = jest.fn()
  params = {}
  route = '/'
  routes = {}
  story: any[] = []
}
