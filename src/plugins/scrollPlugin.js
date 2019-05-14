
/**
 * @param {*} router
 */
function register (router, window) {
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
