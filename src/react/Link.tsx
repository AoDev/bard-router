import React, {useCallback} from 'react'
import Router, {RouteParam} from '../Router'
import injectRouter from './injectRouter'

interface ILinkProps extends React.LinkHTMLAttributes<HTMLAnchorElement> {
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

export function Link({
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
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault()
      router.goTo(to, params)
      if (onClick) {
        onClick(event)
      }
    },
    [to, params, onClick]
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
const InjectedLink = injectRouter(Link) as unknown as React.FC<Omit<ILinkProps, 'router'>>

export default InjectedLink
