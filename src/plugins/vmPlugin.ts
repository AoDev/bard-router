import {diffPaths, splitPath} from '../utils'
import BardRouter, {IRequest} from '../BardRouter'

export function vmPluginInstantiateVM({
  router,
  incomingRequest,
  currentState,
}: {
  router: BardRouter
  incomingRequest: IRequest
  currentState: IRequest
}) {
  const nodes = diffPaths(splitPath(currentState.route), splitPath(incomingRequest.route))
  nodes.forEach((node) => {
    const routeConfig = router.routes[node]
    if (routeConfig.vmPlugin) {
      const {vmClass} = routeConfig.vmPlugin
      // TODO fix type
      //@ts-ignore
      router.vmPlugin.vmTree[node] = new vmClass(router.app.rootStore)
    }
  })
}

export function vmPluginCleanupVM({
  router,
  incomingRequest,
  currentState,
}: {
  router: BardRouter
  incomingRequest: IRequest
  currentState: IRequest
}) {
  const nodes = diffPaths(splitPath(incomingRequest.route), splitPath(currentState.route))
  const {vmTree} = router.vmPlugin
  nodes.forEach((node) => {
    if (vmTree[node] && typeof vmTree[node].destroyVM === 'function') {
      vmTree[node].destroyVM()
    }
  })
}

function register(router: BardRouter) {
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
