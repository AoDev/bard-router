
/**
 *
 * @param {*} router
 * @param {*} options
 */
function setWindowTitleFromRouter (router, options) {
  const routeConfig = router.routes[router.route]
  const titleConfig = routeConfig && routeConfig.data && routeConfig.data.title

  if (typeof titleConfig === 'function') {
    let title = titleConfig(router)
    window.document.title = options.prefix ? options.prefix + title : title
  }
  else if (typeof titleConfig === 'string' || typeof titleConfig === 'number') {
    window.document.title = options.prefix ? options.prefix + titleConfig : titleConfig
  }
  else {
    window.document.title = options.defaultTitle || ''
  }
}

/**
 * Register the plugin with a router instance.
 *
 * How to use:
 * - Add a data.title field to any route config.
 * - title can be either a string or a function.
 * - if it's a function, it will be called with the router as argument.
 *
 * Example
 * ```
 * // myroutes.js
 * {
 *   '/some-page': {
 *     data: {title: 'Some page'}
 *   },
 *   '/some-other-page': {
 *     data: {
 *       title (router) {
 *         const {appStore} = router.app
 *         return `Some other page - ${appStore.someValue}`
 *       }
 *     }
 *   }
 * }
 * ```
 * @param {*} router - Instance of bard router
 * @param {{defaultTitle: String, prefix: String}} options
 */
function register (router, options = {}) {
  const handler = setWindowTitleFromRouter.bind(null, router, options)
  router.on('nav', handler)
  return () => router.off('nav', handler)
}

export default {
  register,
}
