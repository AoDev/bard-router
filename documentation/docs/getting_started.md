---
id: getting_started
title: "Getting started"
sidebar_label: "Getting started"
---

Bard Mobx Router is pretty simple to use, here is an overview of the steps to follow.

## Install

```
npm install bard-router -DE
```

Dependencies needed: `react`, `mobx`, `mobx-react`.

### Source and transpiled versions available
You have the choice to import the source (ES6, JSX, not transpiled) or use a transpiled version.

- transpiled version
eg: `const {Router} = require('bard-router')`

- Not transpiled version is available under `src`  
eg: `import {Router} from 'bard-router'`

If you use the source, you will have to transpile it yourself.  
eg: if you use Webpack:

```js
rules: [
  {
    test: /\.jsx?$/,
    use: ['babel-loader'],
    include: [
      /bard-router/, // <--
      path.resolve(__dirname, 'src'),
    ],
  },
```

## Usage React + mobx

At high level it looks like this:

1. Provide a list of all your routes.
2. Instantiate the router, pass the routes and your mobx root store.
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

### About the route path

The route "path" is reserved to display the right view, in other words: __navigate the app shell__. Each key, like `/private/my-things` will have one corresponding view. Any dynamic content will use the request params to display the corresponding data.

In summary, with bard-router, there is no route like: `/private/thing/:thingID/edit` but rather `/private/thing/edit?thingID=x`. This makes things simpler.

## Instantiate the router

### Accessing your app in the router hooks
To have access to any variables you'd like in the router hooks, like your app store for example, you can set any data through the `app` option. See below.

### Instantiation example

```js
import React from 'react'
import reactDom from 'react-dom'
import * as mobx from 'mobx'
import {Provider} from 'mobx-react'
import {Router} from 'bard-router' // <--
import App from './App'
import RootStore from './stores/RootStore'
import routes from './routes'

const rootStore = new RootStore()
const {uiStore, appStore} = rootStore

// <-- ROUTER -->
const router = new MobxRouter(routes, {
  initialRoute: '/public',
  app: {
    rootStore, // <- Make rootStore available in routes hooks
    otherThings, // you can add more data
  },
})

// <-- Typical React mount -->
const render = (Component) => {
  reactDom.render(
    <Provider router={router} appStore={appStore} uiStore={uiStore}>
      <Component />
    </Provider>,
    document.getElementById('root')
  )
}

render(App)
```