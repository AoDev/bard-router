---
id: router_hooks
title: "Router hooks"
sidebar_label: "Router hooks"
---

As opposed to route specific hooks, the router hooks are handlers that you want to call any time there is a navigation event.

## Hooks available

* `beforeNav` (called before the view / navigation transition)
* `afterNav` (called after the view / navigation was done)

These handlers are called with an event object like this:

```js
{
  router,             // reference to the router
  incomingRequest,    // the new request
  currentState,       // the current/previous request (depending on the point of view, after/before nav)
  goToOptions,        // goToOptions are mostly for internal purposes (like POP, goBack, ...)
}
```

## Example

A typical use case is to scroll back to top when the user navigates to a different section of your app.

That's what the [scrollPlugin](https://github.com/AoDev/bard-router/tree/master/src/plugins) does internally.

```js
router.on('aferNav', () => window.scrollTo(0, 0))
```
