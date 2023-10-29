import Router from '../Router'

function register(router: Router, window: {scrollTo: (x: number, y: number) => void}) {
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
