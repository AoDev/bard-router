---
id: getting_started
title: Getting started
sidebar_label: Getting started
---

Bard Mobx Router is pretty simple to use, here is an overview of the steps to follow.

## Install

```
npm install bard-router -DE
```

Dependencies needed: `react`, `mobx`, `mobx-react`.

## Usage React + mobx

At high level it looks like this:

1. Instantiate the router
2. Create route configs and pass them to the router.
3. Make the router available in React context with `mobx Provider`.
4. Use `<Link/>` and `<Route/>` in your React components.
5. Use `router.goTo` when you need programmatic navigation.

## Instantiate the router

Create an instance and make it available with mobx-react Provider.

### Instantiation example

```js
import reactDom from 'react-dom'
import {Provider} from 'mobx-react'
import App from './App' // React root component
import RootStore from './stores/RootStore' // mobx store
import {Router} from 'bard-router'

const rootStore = new RootStore()
const router = new Router({
  '/feature-route': {
    /*...*/
  },
})
// Note: you can set the routes later with `router.routes = {'/feature-route' ...}``

// <-- Typical React mount -->
const render = (Component) => {
  reactDom.render(
    <Provider router={router} rootStore={rootStore}>
      <Component />
    </Provider>,
    document.getElementById('root')
  )
}

render(App)
```

### Configuring routes

The router expects a map of your routes with optional hooks.

> Bard Router does not need all your routes to be listed. Define only the ones that need special handling, such as redirects, data check, etc.

`routes.js`

```js
const routes = {
  '/': {}, // route config
  '/private': {
    // eg: prevent access to sections that need authentication
    intercept(request) {
      if (!rootStore.signedIn) {
        request.route = '/public/signin'
      }
      return request
    },
  },
  '/private/my-things': {
    // eg: modify request params if missing
    intercept(request) {
      if (typeof request.params.thingId === 'undefined') {
        request.params.thingId = getFirstThingId()
      }
      return request
    },
  },
  '/private/my-things/details': {},
  '/public/tracked': {
    // eg: run a function on navigation
    afterEnter() {
      reportUserVisit('tracked')
    },
  },
  // ...
}
export default routes
```

### About the route path

The route "path" is reserved to display the right view, in other words: **navigate the app shell**. Each key, like `/private/my-things` will have one corresponding view. Any dynamic content will use the request params to display the corresponding data.

In summary, with bard-router, there is no route like: `/private/thing/:thingID/edit` but rather `/private/thing/edit?thingID=x`. This makes things simpler.
