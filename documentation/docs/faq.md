---
id: faq
title: "How-to's / FAQ"
sidebar_label: "How-to's / FAQ"
---

## How to redirect?
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

## How to reset the window scroll when navigating?
Use the [scrollPlugin](https://github.com/AoDev/bard-router/tree/master/src/plugins).


## How to handle 404 / not found?
1. Set the `routeNotFound` option that should be the route to redirect to.
```js
const router = new Router({
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

Ideally, the component should be at the root of your UI.  
It means that if your root component is `App`, then the snippet above should be in this component.
