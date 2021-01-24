import BardRouter from '../BardRouter'

function register(router: BardRouter, window: {scrollTo: (x: number, y: number) => void}) {
  const scrollPluginHandler = () => window.scrollTo(0, 0)

  router.on('afterNav', scrollPluginHandler)

  const unregister = () => {
    router.off('afterNav', scrollPluginHandler)
  }

  return unregister
}

export default {
  register,
}
