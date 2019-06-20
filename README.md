# Bard mobx router

[![npm version](https://badge.fury.io/js/bard-router.svg)](https://badge.fury.io/js/bard-router)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Known Vulnerabilities](https://snyk.io/test/github/AoDev/bard-router/badge.svg)](https://snyk.io/test/github/AoDev/bard-router)
[![Community chat](https://badges.gitter.im/AoDev/bard-router.svg)](https://gitter.im/AoDev/bard-router?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**More than just a routing solution, for React/Mobx applications**.

## Features summary

* Router with a `very simple API`, and `navigation hooks`.
* React components `<Link/>` and `<Route/>` that observe the router state and react accordingly.
* A collection of plugins to make your life easier (history, window title, scroll, vms). [Plugins docs](https://github.com/AoDev/bard-router/tree/master/src/plugins).

## Current state: **Beta**

I am using it in my production react/mobx apps, in browsers and in Desktop apps with Electron. It still has a few "glitches" or miss some use cases. That can be easily fixed with feedback.

## The name

> In medieval Gaelic and British culture, a **"bard"** was a story teller.  They would talk about the people's journey in the world. A user interacting with an aplication is like a journey that the router allows to take, tell and remember.

## Philosophy: simplicity + decouple state and UI + app shell architecture

Inspired by this article from mobx author: [decouple state and UI](https://hackernoon.com/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37), **bard-router** allows you to command your application models and select the right view to present the data while adhering to the original philosophy of React: `(appState) => UI`.

The "opiniated side" of **bard-router** also comes from ideas of the [app shell architecture](https://developers.google.com/web/fundamentals/architecture/app-shell).

## Install

```
npm install bard-router -DE
```

Dependencies needed: `react`, `mobx`, `mobx-react`.

### Source and transpiled versions available
You have the choice to import the source (ES6, JSX, not transpiled) or use a transpiled version.

- transpiled version is available under `lib`  
eg: `const Router = require('bard-router/lib/Router')`

- ES6 version is available under `src`  
eg: `import Router from 'bard-router/src/Router'`

If you use the source, you will have to transpile it yourself.  
eg: if you use Webpack:

```js
rules: [
  {
    test: /\.jsx?$/,
    use: ['babel-loader'],
    include: [
      /bard-router/,
      path.resolve(__dirname, 'src'),
    ],
  },
```

## Usage React + mobx

At high level it looks like this:

1. You will provide a list of all your routes, with optional hooks.
2. Instantiate the router, passing the routes and you mobx root store.
3. Make the router available in React context with `mobx Provider`.
4. Use `<Link/>` and `<Route/>` in your React components.
5. Use `router.goTo` when you need programmatic navigation.

### Configuring routes

Create a module that exports a map of your routes with optional hooks.

`routes.js`
```js
const routes = {
  '/': {}, // route config
  '/public': {},
  '/public/sign-in': {},

  '/private': {},
  '/private/my-things': {},
  '/private/my-things/details': {}

  // ...
}
export default routes
```

The routes request "path" is strictly reserved to display the right view, in other words: __navigate the app shell__, while any dynamic content, usually coming from a web API, will use the request params to display the corresponding data.

Eg: with bard-router, there is no route like: `/private/thing/:thingID/edit` but rather `/private/thing/edit?thingID=x`.


#### Route hooks available

- `beforeEnter`: called before entering route UI transition
- `afterEnter`: called after entering route UI transition
- `beforeLeave`: called before leaving route UI transition
- `afterLeave`: called after leaving route UI transition
- `intercept`: meant to process the navigation request before any hook (renamed from `onTheWay`)
- `onTheWay`: DEPRECATED - same as intercept, will be removed in next version.

### The `intercept` hook

Is specifically meant to alter navigation requests. **It must always return a navigation request**.

The typical use case is for handling **redirection** or **setting default parameters**.

Example 1: `checking if the user is logged-in`
```js
  '/private': {
    intercept (router, request) {
      const {appStore} = router.app
      if (!appStore.user.isAuthenticated()) {
        request.route = '/not-allowed'
      }
      return request
    },
  },
```

### Routes config full example

`routes.js`
```js
const routes = {
  '/': {},
  '/public': {},
  '/not-allowed': {},

  '/private': {
    intercept (router, request) {
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
    },
  },

  '/private/my-things/details': {
    intercept (router, request) {
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

### Router hooks
As opposed to route specific hooks, the router hooks are handlers that you want to call any time there is a navigation event.

* `beforeNav` (called before the view / navigation transition)
* `afterNav` (called after the view / navigation was done)

These handlers are called with an event object like this:

```js
router,             // reference to the router
incomingRequest,    // the new request
currentState,       // the current/previous request (depending on the point of view, after/before nav)
goToOptions,        // goToOptions are mostly for internal purposes (like POP, goBack, ...)
```

#### Examples

A typical use case is to scroll back to top when the user navigates to a different section of your app.

That's what the [scrollPlugin](https://github.com/AoDev/bard-router/tree/master/src/plugins) does internally.

```js
router.on('aferNav', () => window.scrollTo(0, 0))
```

### Instantiating the router

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
const router = new MobxRouter(routes, {
  initialRoute: '/public',
  app: {
    appStore,
  },
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

To help with typical UI patterns, you can automatically get an `active` CSS class on your link if it matches the current route, by setting the `autoActive` attribute.

You can manually control this behaviour by setting `active={true|false}`.

#### Link component example
```js
import React from 'react'
import Link from 'bard-router/mobx/react/Link'

export default function SomeTextWithLink () {
  return (
    <div>
      <h3>Do something</h3>
      <p>
        <Link autoActive to="/private/my-things" params={{id: 1}}>
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

## Navigation history
`bard-router` already maintains its internal history, it is thus independent of the environment.

The router history can simply be read at `router.story`.  
It is an array with the list of navigation requests that looks like this:

```js
[
  {route: '/private/my-stuff', params: {stuffID: 'stuff1'}},
  {route: '/public', params: {},
  {route: '/', params: {param1: 'value1'}},
]
```
The first element is the most recent request.

In the case of MobxRouter, it is observable.

### You can go back

```js
router.goBack()
```

## Using browser html5 history

[Check the html5HistoryPlugin](https://github.com/AoDev/bard-router/tree/master/src/plugins)

## Recipes / FAQ

### How to redirect?
Use the `intercept` hook in the relevant routes config and return a new request.

Example

```js
'/some-route': {
  intercept (router, request) {
    if (shouldRedirect(router.app.appStore)) {
      request.route = '/somewhere-else'
    }
    return request
  },
},
```

### How to reset the window scroll when navigating?
Use the [scrollPlugin](https://github.com/AoDev/bard-router/tree/master/src/plugins).

### How to handle 404 / not found?
1. Set the `routeNotFound` option that should be the route to redirect to.
```js
const router = new MobxRouter({
  routeNotFound: '/not-found',
  /*...*/
})
```

2. Have a defined corresponding route
```js
{
  '/not-found': {},
}
```

3. Add a corresponding Route + Component in your UI
```js
<Route path="/not-found" Component={NotFound}/>
```
