import {vi} from 'vitest'
import type {IBardRouter} from '../src/Router'

export class RouterMock implements IBardRouter {
  currentRouteConfig = {}
  eventHandlers: IBardRouter['eventHandlers'] = {beforeNav: [], afterNav: []}
  goBack = vi.fn()
  goTo = vi.fn()
  off = vi.fn()
  on = vi.fn()
  onAfterNav: IBardRouter['eventHandlers']['afterNav'] = []
  onBeforeNav: IBardRouter['eventHandlers']['beforeNav'] = []
  options = {}
  paramMatch = vi.fn()
  params = {}
  route = '/'
  routes = {}
  story: any[] = []
}
