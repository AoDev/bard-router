import {observer, inject} from 'mobx-react'
import PropTypes from 'prop-types'
import React from 'react'

export class Link extends React.Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }

  checkIfActive (to, linkParams) {
    const {router} = this.props
    return router.route.startsWith(to) && router.paramMatch(router.params, linkParams)
  }

  onClick (event) {
    event.preventDefault()
    const {onClick, to, router, params} = this.props
    if (to) {
      router.goTo({route: to, params})
    }
    if (onClick) {
      onClick(to || null, event)
    }
  }

  render () {
    const {to, active, params, onClick, router, className, autoActive, ...otherProps} = this.props
    let cssClasses = className || ''

    if ((autoActive && this.checkIfActive(to, params)) || active === true) {
      cssClasses += ' active'
    }

    return (
      <a href={to} onClick={this.onClick} {...otherProps} className={cssClasses}>
        {this.props.children}
      </a>
    )
  }
}

export default inject('router')(observer(Link))

Link.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
  params: PropTypes.object,
  children: PropTypes.node,
  autoActive: PropTypes.bool.isRequired,
  active: PropTypes.bool,
  router: PropTypes.shape({
    route: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
}

Link.defaultProps = {
  params: {},
  autoActive: false,
}
