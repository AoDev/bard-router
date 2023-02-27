import React from 'react'
import {inject, observer} from 'mobx-react'
import BardRouter from '../BardRouter'

export type RouteProps<T extends Record<string, unknown>> = {
  router?: BardRouter
  path: string
  Component: React.ComponentType<T>
} & T

export function Route<T extends Record<string, unknown>>(props: RouteProps<T>) {
  const {router, path, Component, ...otherProps} = props
  if (!router?.route.startsWith(path)) {
    return null
  }
  if (router.vmPlugin && router.vmPlugin.vmTree[path] && 'vm' in otherProps) {
    // @ts-ignore
    otherProps.vm = router.vmPlugin.vmTree[path]
  }
  // @ts-ignore
  return <Component {...otherProps} />
}

const InjectedRoute = inject((stores: {router: BardRouter}) => ({
  router: stores.router as BardRouter,
}))(observer(Route))

export default InjectedRoute
