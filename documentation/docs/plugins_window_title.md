---
id: plugins_window_title
title: 'Window title plugin'
sidebar_label: 'Window title plugin'
---

> **Automatically sync the page title with the router state.**

## How to use the window title plugin?

- Add a `windowTitlePlugin` field to any route config.
- _title_ can be either a `string` or a `function`.
- if it's a function, it will be called with the router as argument.

## Example

1. configure the routes

```js
{
  '/some-page': {
    windowTitlePlugin: 'Some page',
  },
  '/some-other-page': {
    windowTitlePlugin: () => `Some other page - ${getSomeValue()}`,
  },
}
```

2. register the plugin

```js
// where you bootstrap your app_ (eg: Rootstore)
import {Router, windowTitlePlugin} from 'bard-router'

const router = new Router({...})

windowTitlePlugin.register(this.router, {
  defaultTitle: 'Bard',
  prefix: 'Bard - ',
})
```

Note, if for any reason you'd like to unregister the plugin, windowTitlePlugin.register returns a disposer function that you can just call:

```js
const stopTitlePlugin = windowTitlePlugin.register(...)

stopTitlePlugin()
```

## windowTitlePlugin options

- **defaultTitle** {string} - used as fallback for routes with undefined title
- **prefix** {string} - Will be put in front of all your titles. (eg: app name)

In the example above, it means that the page title would look like: `Bard - Some page`
