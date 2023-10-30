---
id: route_hooks
title: 'Route specific hooks'
sidebar_label: 'Route specific hooks'
---

**Use route hooks if you need to redirect or run custom logic for a particular navigation request.**

## Hooks available

- `beforeEnter`: called before entering route transition
- `afterEnter`: called after entering route transition
- `beforeLeave`: called before leaving route transition
- `afterLeave`: called after leaving route transition
- `intercept`: meant to process the navigation request before any hook

## `before / after` hooks

Allow to do anything for a particular route, like loading data for the corresponding view. Their function signature is the following:
`beforeEnter(request, router)`

## `intercept` hook

Is specifically meant to alter navigation requests.

> **It must always return a navigation request**.  
> eg: `{route: '/some/route', params: {}}`

The typical use case is for handling **redirection** or **setting parameters**.

## Full example

Shows fetching data, setting default params, accessing the app store and redirection.

```js
// routes.js
const routes = {
  '/': {},
  '/public': {},
  '/not-allowed': {},

  '/private': {
    intercept(request, router) {
      // Example checking auth, you have access to your app store
      const {appStore} = router.app
      if (!appStore.user.isAuthenticated()) {
        request.route = '/not-allowed'
      }
      return request
    },
  },

  '/private/my-things': {
    intercept(request, router) {
      // Example: redirection
      if (request.route === '/private/my-things') {
        request.route = '/private/my-things/details'
      }
      return request
    },
  },

  '/private/my-things/details': {
    // Example: setting default params
    intercept(request, router) {
      if (typeof request.params.thingID === 'undefined') {
        request.params.thingID = DEFAULT_ID
      }
      return request
    },

    // Example: fetching some data before UI is shown
    beforeEnter(request, router) {
      const {appStore} = router.app
      const {params} = request
      appStore.myThings.fetchDetails(params.thingID)
      return request
    },
  },
}

export default routes
```
