import {inject, observer} from 'mobx-react'
import {type FC, type LinkHTMLAttributes, type MouseEvent, useCallback} from 'react'
import type {RouteParam, Router} from '../Router'

export interface ILinkProps extends LinkHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
  autoActive?: boolean
  className?: string
  params?: RouteParam
  router: Router
  to: string
}

/**
 * Helper to set an "active" css class on the link when current location matches
 */
function isLinkActive(router: Router, to: string, params: RouteParam) {
  return router.route.startsWith(to) && router.paramMatch(router.params, params)
}

export function PlainLink({
  to,
  active,
  params = {},
  onClick,
  router,
  className = '',
  autoActive = false,
  ...otherProps
}: ILinkProps) {
  const handleOnClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
      event.preventDefault()
      router.goTo(to, params)
      if (onClick) {
        onClick(event)
      }
    },
    [to, params, onClick, router.goTo]
  )

  let cssClasses = className

  if ((autoActive && isLinkActive(router, to, params)) || active === true) {
    cssClasses += ' active'
  }

  return (
    <a href={to} onClick={handleOnClick} {...otherProps} className={cssClasses}>
      {otherProps.children}
    </a>
  )
}

/**
 * Link component with the router already available
 */
const InjectedLink = inject((stores: {router: Router}) => ({router: stores.router}))(
  observer(PlainLink)
)

export const Link = InjectedLink as unknown as FC<Omit<ILinkProps, 'router'>>
