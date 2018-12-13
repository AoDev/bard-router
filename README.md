# Bard router
**Routing solutions for applications (a personal experiment)**


Main use case is for my Electron application, built with React and Mobx.


## Current state: **not production ready**

It is open source, published on npm but not production ready.  
That said, if you use React, mobx and Electron, it works.

If my "experiment" proves interesting enough, I'll turn this into an actual solution for anyone, with proper tests, browser history, URL support, etc...


## Install

`npm install bard-router -DE`

- It is written in ES6 and not yet transpiled as a dist. (you need to transpile it yourself)
- You'd need lodash, react, mobx, mobx-react available.


## Usage

*TODO: complete this*
(Actual docs coming later...)

1. Define your routes as a map.
2. Instantiate the router, passing the routes and you app store.
3. Make the router available in React context.
4. Use `<Link/>` and `<Route/>` in your React components.

The router provides various hooks:
- `beforeEnter`
- `afterEnter`
- `beforeLeave`
- `afterLeave`
- `onTheWay` (meant to process the navigation request before any hook; example: redirection)
