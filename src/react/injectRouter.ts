import Router from '../Router'
import {inject, observer} from 'mobx-react'
import {IReactComponent} from 'mobx-react/dist/types/IReactComponent'

/**
 * inject router in props + turn component in observer
 */
export default function injectRouter(component: IReactComponent) {
  return inject((stores: {router: Router}) => ({router: stores.router}))(observer(component))
}
