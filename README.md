# Bard router
**Routing solutions for applications (a personal experiment)**  
Main use case is for my Electron application, built with React and Mobx.

## The name

> In medieval Gaelic and British culture, a **"bard"** was a story teller.  They would talk about the people's journey in the world. A user interacting with an aplication is like a journey that the router allows to take, tell and remember.

## Current state: **not production ready**

It is open source, published on npm but not production ready.  
That said, if you use React, mobx and Electron, it works.

If my "experiment" proves interesting enough, I'll turn this into an actual solution for anyone, with proper tests, browser history, URL support, etc...


## Philosophy

This router approach is based on how the story of a journey could be told: "a succession of steps to reach a goal".

This has a direct influence on how you reason about your routes and your UI. More explanations will be given later.


## Install

`npm install bard-router -DE`

- It is written in ES6 and not yet transpiled as a dist. (you need to transpile it yourself)
- You'd need lodash, react, mobx, mobx-react available.


## Usage React + mobx

At high level it looks like this:

1. You will provide a list of all your routes, with optional hooks.
2. Instantiate the router, passing the routes and you mobx app store.
3. Make the router available in React context with `mobx Provider`.
4. Use `<Link/>` and `<Route/>` in your React components.
5. Use `router.goTo` when you need programmatic navigation.

### Configuring routes

Create a module that exports a map of your routes with optional hooks.

#### Hooks available

- `beforeEnter`: called before entering route UI transition
- `afterEnter`: called after entering route UI transition
- `beforeLeave`: called before leaving route UI transition
- `afterLeave`: called after leaving route UI transition
- `onTheWay`: meant to process the navigation request before any hook; example: redirection
- `onNav`: called after entering any view.

#### Route example

`routes.js`
```js
const routes = {
  '/': {},
  '/public': {},
  '/not-allowed': {},

  '/private': {
    onTheWay (router, request) {
      // Example checking auth, you have access to your app store
      const {appStore} = router.app
      if (!appStore.user.isAuthenticated()) {
        request.route = '/not-allowed'
      }
      return request
    },
  },

  '/private/my-things': {
    beforeEnter (router, request) {
      // Example fetching some data before UI is shown
      const {appStore} = router.app
      appStore.fetchMyThings()
      return request
    },
  },

  '/private/my-things/details': {
    onTheWay (router, request) {
      // Example setting default params
      if (typeof request.thingID === 'undefined') {
        request.params.thingID = DEFAULT_ID
      }
      return request
    },
  }
}

export default routes
```


### Instantiating the router
Typically done where you mount your app.

#### Accessing your app in the router hooks
To have access to any variables you'd like in the router hooks, like your app store for example, you set it through the `app` option. See below.

#### Instantiation example

```js
import React from 'react'
import reactDom from 'react-dom'
import * as mobx from 'mobx'
import {Provider} from 'mobx-react'
import {AppContainer} from 'react-hot-loader'
import MobxRouter from 'bard-router/lib/mobx/MobxRouter' // <--
import App from './App'
import RootStore from './stores/RootStore'
import routes from './routes'

const rootStore = new RootStore()
const {uiStore, appStore} = rootStore

// <-- ROUTER -->
const router = new MobxRouter(options.routes, {
  initialRoute: '/public',
  app: {
    appStore,
  },
  onNav () {
    window.scrollTo(0, 0) // scroll back to top when switching view
  }
})

// <-- Typical React mount -->
const render = (Component) => {
  reactDom.render(
    <AppContainer>
      <Provider router={router} appStore={appStore} uiStore={uiStore}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)
```

### Using `<Link/>` component

Link gets two props: `to` and `params` that represents a routing request.

The Link component will set an `"active"` css class by default if it matches the current route. Useful for menus for example.

You can control this behaviour by setting. `active={true|false}`

#### Link component example
```js
import React from 'react'
import Link from 'bard-router/mobx/react/Link'

export default function SomeTextWithLink () {
  return (
    <div>
      <h3>Do something</h3>
      <p>
        <Link to="/private/my-things" params={{id: 1}}>
          View your things
        </Link>.
      </p>
    </div>
  )
}
```

### Using `<Route/>` component

Route are simple UI switches that either render or not the corresponding UI component depending on the router state.

It takes two arguments: `path` and `Component`.
If router state matches the path, Component is displayed.

Any other prop set on Route will be passed to Component.

#### Route component example

```js
import React from 'react'
import Link from 'bard-router/mobx/react/Route'
import MyComponent from './MyComponent'

// MyComponent will render only if router state
// - matches `/private/my-things`
// - matches a deeper path `/private/my-things/details`

export default function SomeComponentWithRoute () {
  return (
    <div>
      <Route
        path="/private/my-things"
        Component={MyComponent}
        thingID={1}/>
    </div>
  )
}
```
