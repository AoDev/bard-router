import PropTypes from 'prop-types'
import React from 'react'
import {inject, observer} from 'mobx-react'
import BardRouter from '../BardRouter'

interface IRouteProps {
  router: BardRouter
  path: string
  Component: React.ComponentType
}

export function Route(props: IRouteProps) {
  const {router, path, Component, ...otherProps} = props
  if (!router.route.startsWith(path)) {
    return null
  }
  if (router.vmPlugin && router.vmPlugin.vmTree[path]) {
    // @ts-ignore TODO: fix type of vm
    otherProps.vm = router.vmPlugin.vmTree[path]
  }
  return <Component {...otherProps} />
}

Route.propTypes = {
  Component: PropTypes.elementType.isRequired,
  router: PropTypes.shape({
    vmPlugin: PropTypes.shape({
      vmTree: PropTypes.shape({}),
    }),
    route: PropTypes.string.isRequired,
    goTo: PropTypes.func.isRequired,
  }),
  path: PropTypes.string.isRequired,
}

export default inject('router')(observer(Route))
