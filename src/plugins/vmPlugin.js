import {diffPaths, splitPath} from '../utils'

/**
 * @param {{router: {vmPlugin: {vmTree: *}},incomingRequest: {route: string}, currentState: {route: string}}} - beforeNav event
 */
export function vmPluginInstantiateVM ({router, incomingRequest, currentState}) {
  const nodes = diffPaths(splitPath(currentState.route), splitPath(incomingRequest.route))
  nodes.forEach((node) => {
    const routeConfig = router.routes[node]
    if (routeConfig.vmPlugin) {
      const {vmClass} = routeConfig.vmPlugin
      router.vmPlugin.vmTree[node] = new vmClass(router.app.rootStore) // eslint-disable-line
    }
  })
}

/**
 * @param {{router: {vmPlugin: {vmTree: *}},incomingRequest: {route: string}, currentState: {route: string}}} - afterNav event
 */
export function vmPluginCleanupVM ({router, incomingRequest, currentState}) {
  const nodes = diffPaths(splitPath(incomingRequest.route), splitPath(currentState.route))
  const {vmTree} = router.vmPlugin
  nodes.forEach((node) => {
    if (vmTree[node] && typeof vmTree[node].destroyVM === 'function') {
      vmTree[node].destroyVM()
    }
  })
}

/**
 * @param {*} router
 */
function register (router) {
  router.on('beforeNav', vmPluginInstantiateVM)
  router.on('afterNav', vmPluginCleanupVM)

  const unregister = () => {
    router.off('beforeNav', vmPluginInstantiateVM)
    router.off('afterNav', vmPluginCleanupVM)
    delete router.vmPlugin
  }

  router.vmPlugin = {
    vmTree: {},
  }

  return unregister
}

export default {
  register,
}
