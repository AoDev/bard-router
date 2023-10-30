---
id: faq
title: How-to's / FAQ
sidebar_label: How-to's / FAQ
---

Simple solutions for challenges that one faces usually with routing.

## How to redirect?

Use the `intercept` hook in the relevant routes config and return a new request.

Example

```js
'/some-route': {
  intercept (request, router) {
    if (shouldRedirect()) {
      request.route = '/somewhere-else'
    }
    return request
  },
},
```

## How to reset the window scroll when navigating?

Use the [scrollPlugin](https://github.com/AoDev/bard-router/tree/master/src/plugins).
