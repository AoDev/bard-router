import PropTypes from 'prop-types'
import React from 'react'
import {inject, observer} from 'mobx-react'

function Route (props) {
  const {router, path, Component, ...otherProps} = props
  return router.route.startsWith(path) ? <Component {...otherProps}/> : null
}

export default inject('router')(observer(Route))

Route.propTypes = {
  Component: PropTypes.func.isRequired,
  router: PropTypes.shape({
    route: PropTypes.string.isRequired,
    goTo: PropTypes.func.isRequired,
  }),
  path: PropTypes.string.isRequired,
}
