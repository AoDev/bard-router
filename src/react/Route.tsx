import React from 'react'
import Router from '../Router'
import injectRouter from './injectRouter'

export type RouteProps<T extends Record<string, unknown>> = {
  router?: Router
  path: string
  Component: React.ComponentType<T>
} & T

export function Route<T extends Record<string, unknown>>(props: RouteProps<T>) {
  const {router, path, Component, ...otherProps} = props
  if (!router?.route.startsWith(path)) {
    return null
  }
  // @ts-expect-error TODO Dont know how to solve this type issue
  return <Component {...otherProps} />
}

/**
 * Route component with the router already available
 */
export default injectRouter(Route)
