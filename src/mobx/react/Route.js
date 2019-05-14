import PropTypes from 'prop-types'
import React from 'react'
import {inject, observer} from 'mobx-react'

function Route (props) {
  const {router, path, Component, ...otherProps} = props
  if (!router.route.startsWith(path)) {
    return null
  }
  if (router.vmPlugin && router.vmPlugin.vmTree[path]) {
    otherProps.vm = router.vmPlugin.vmTree[path]
  }
  return <Component {...otherProps}/>
}

Route.propTypes = {
  Component: PropTypes.func.isRequired,
  router: PropTypes.shape({
    route: PropTypes.string.isRequired,
    goTo: PropTypes.func.isRequired,
  }),
  path: PropTypes.string.isRequired,
}

export default inject('router')(observer(Route))
