import {observer, inject} from 'mobx-react'
import React, {LinkHTMLAttributes} from 'react'
import BardRouter from '../BardRouter'

interface ILinkProps extends LinkHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
  autoActive?: boolean
  className?: string
  params: Record<string, string | number>
  router?: BardRouter
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

  onClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    event.preventDefault()
    const {onClick, to, router, params} = this.props
    if (to) {
      router.goTo({route: to, params})
    }
    if (onClick) {
      onClick(event)
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

const InjectedLink = inject((stores: {router: BardRouter}) => ({
  router: stores.router as BardRouter,
}))(observer(Link))

export default InjectedLink
