import PropTypes from 'prop-types'
import React from 'react'
import {inject, observer} from 'mobx-react'

export class Route extends React.Component {
  constructor (props) {
    super(props)
    this.check = props.router.getRouteCheck(props.path)
  }

  render () {
    const {router, path, Component, not, ...otherProps} = this.props
    const shouldRender = not ? !this.check.test(router.route) : this.check.test(router.route)
    return shouldRender ? <Component {...otherProps}/> : null
  }
}

export default inject('router')(observer(Route))

Route.propTypes = {
  Component: PropTypes.func.isRequired,
  not: PropTypes.bool.isRequired,
  router: PropTypes.shape({
    goTo: PropTypes.func.isRequired,
    getRouteCheck: PropTypes.func.isRequired,
  }),
  path: PropTypes.string.isRequired,
}

Route.defaultProps = {
  not: false,
}
