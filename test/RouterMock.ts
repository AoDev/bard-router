import {vi} from 'vitest'
import type {IBardRouter} from '../src/Router'

export default class RouterMock implements IBardRouter {
  currentRouteConfig = {}
  eventHandlers = {beforeNav: [] as any[], afterNav: [] as any[]}
  goBack = vi.fn()
  goTo = vi.fn()
  off = vi.fn()
  on = vi.fn()
  onAfterNav: any[] = []
  onBeforeNav: any[] = []
  options = {}
  paramMatch = vi.fn()
  params = {}
  route = '/'
  routes = {}
  story: any[] = []
}
