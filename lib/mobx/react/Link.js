import {observer, inject} from 'mobx-react'
import PropTypes from 'prop-types'
import React from 'react'
import isEqual from 'lodash/isEqual'

export class Link extends React.Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
    this.check = props.router.getRouteCheck(props.to)
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
    const {to, active, params, onClick, router, className, ...otherProps} = this.props
    const matchFullPath = router.route === to
    let cssClasses = className || ''
    if (
      (typeof active === 'boolean' && active === true) ||
      (matchFullPath && isEqual(params, router.params)) ||
      (!matchFullPath && this.check.test(router.route))
    ) {
      cssClasses += ' active'
    }

    return (
      <a href={to} onClick={this.onClick} {...otherProps} className={cssClasses}>
        {this.props.children}
      </a>
    )
  }
}

export default inject(({router}) => ({
  router
}))(observer(Link))

Link.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
  params: PropTypes.object,
  children: PropTypes.node,
  active: PropTypes.bool,
  router: PropTypes.shape({
    route: PropTypes.string.isRequired,
    getRouteCheck: PropTypes.func.isRequired,
  }).isRequired,
  className: PropTypes.string,
}

Link.defaultProps = {
  params: {},
}
