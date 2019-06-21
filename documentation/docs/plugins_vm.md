---
id: plugins_vm
title: "VM plugin (experimental)"
sidebar_label: "VM plugin (experimental)"
---

> **The `vmPlugin` is meant to facilitate the [decouple state and UI](https://hackernoon.com/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37) philosophy.**

It is experimental and could change or disappear. It allows to greatly simplify a React app architecture.

## What are VM (view models) for?

A "VM" is an adapter that takes business data and prepare / format / provide it to a UI component. This "bridge" allows to decouple UI from data.

At the same time a VM may contain UI specific state, like some element visibility, etc. Your UI components are really just templates while you keep 100% control over their behaviour and your data.


## How to use the vm plugin?

### 1. Register the plugin

```js
const rootStore = new RootStore()
const router = new Router({
  app: {
    rootStore, // <- will be available in any VM
  }
})
vmPlugin.register(router)
```

> **You must provide your root store at `app.rootStore`** so that it can be injected in your VM.  

### 2. Make the router available through context

```js
// generally, where you bootstrap your app
import {Provider} from 'mobx-react'

reactDom.render(
  <Provider router={router}>
    <Component />
  </Provider>,
  document.getElementById('root')
)
```

### 3. Have some component displayed with `<Route/>`
```js
// MyComponent.js - a component that will use a VM for its data.
function MyComponent (props) {
  const {vm} = props
  return <div>{vm.someData}</div>
}

export default observer(MyComponent)

// App.js - displays MyComponent when user navigates to '/my-component'
function App () {
  return (
    <div><Route path="/my-component" Component={MyComponent}/></div>
  )
}
```

### 4. Define the "view model" that your component needs
```js
class MyComponentVM {
  @observable someData = '...'
  // some actions, etc...

  constructor (rootStore) {
    // the VM will receive the rootStore and thus can access the app business models.
    this.rootStore = rootStore
  }
}
```

### 5. Configure the route with the plugin options

```js
import MyComponentVM from './MyComponentVM'

// routes.js
export default {
  '/': {},
  '/my-component': {
    vmPlugin: {vmClass: MyComponentVM},
  }
}
```

## The gist of it

`Component(vm(rootStore)) => UI`
