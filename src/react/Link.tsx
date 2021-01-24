import {observer, inject} from 'mobx-react'
import React from 'react'
import BardRouter from '../BardRouter'

type linkParams = {[key: string]: string | number}

interface ILinkProps {
  active?: boolean
  autoActive?: boolean
  className?: string
  onClick?: (to: string | null, event: React.MouseEvent) => void
  params: linkParams
  router: BardRouter
  to: string
}

export class Link extends React.Component<ILinkProps> {
  static defaultProps = {
    params: {},
    autoActive: false,
  }

  constructor(props: ILinkProps) {
    super(props)
    this.onClick = this.onClick.bind(this)
    this.checkIfActive = this.checkIfActive.bind(this)
  }

  checkIfActive() {
    const {router, params, to} = this.props
    return router.route.startsWith(to) && router.paramMatch(router.params, params)
  }

  onClick(event: React.MouseEvent) {
    event.preventDefault()
    const {onClick, to, router, params} = this.props
    if (to) {
      router.goTo({route: to, params})
    }
    if (onClick) {
      onClick(to || null, event)
    }
  }

  render() {
    const {to, active, params, onClick, router, className, autoActive, ...otherProps} = this.props
    let cssClasses = className || ''

    if ((autoActive && this.checkIfActive()) || active === true) {
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
