---
id: component_route
title: <Route/> component
sidebar_label: <Route/>
---

`Route` are simple UI switches that either render or not the corresponding UI component depending on the router state.

It takes two arguments: `path` and `Component`, any other prop set on Route will be passed to Component.

If router state matches the path, Component is displayed.

### Route component example

```js
import React from 'react'
import {Route} from 'bard-router'
import MyComponent from './MyComponent'

// MyComponent will render only if router state
// - matches `/private/my-things`
// - or, matches a deeper path `/private/my-things/details`

export default function SomeComponentWithRoute() {
  return (
    <div>
      <Route path="/private/my-things" Component={MyComponent} thingID={1} />
    </div>
  )
}
```
