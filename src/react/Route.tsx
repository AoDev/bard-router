import {inject, observer} from 'mobx-react'
import type {ComponentProps, ComponentType, JSX} from 'react'
import {createElement} from 'react'
import type {Router} from '../Router'

export interface RouteOwnProps<C extends ComponentType<any>> {
  router: Router
  path: string
  // biome-ignore lint/style/useNamingConvention: API intentionally uses React's conventional Component prop.
  Component: C
}

export type RouteProps<C extends ComponentType<any>> = RouteOwnProps<C> & ComponentProps<C>

export type InjectedRouteProps<C extends ComponentType<any>> = Omit<RouteOwnProps<C>, 'router'> &
  ComponentProps<C>

type RouteComponent = <C extends ComponentType<any>>(props: RouteProps<C>) => JSX.Element | null
type InjectedRouteComponent = <C extends ComponentType<any>>(
  props: InjectedRouteProps<C>
) => JSX.Element | null

export const PlainRoute: RouteComponent = (props) => {
  const {router, path, Component, ...otherProps} = props
  if (!router?.route.startsWith(path)) {
    return null
  }
  return createElement(Component, otherProps as ComponentProps<typeof Component>)
}

/**
 * Route component with the router already available
 */
const InjectedRoute = inject((stores: {router: Router}) => ({router: stores.router}))(
  observer(PlainRoute)
)

export const Route = InjectedRoute as unknown as InjectedRouteComponent
