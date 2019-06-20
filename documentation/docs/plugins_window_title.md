---
id: plugins_window_title
title: "Window title plugin"
sidebar_label: "Window title plugin"
---

> **Automatically sync the page title with the router state.**

## How to use the window title plugin?

* Add a `windowTitlePlugin.title` field to any route config.
* _title_ can be either a `string` or a `function`.
* if it's a function, it will be called with the router as argument.

## Example

1. configure the routes
```js
{
  '/some-page': {
    windowTitlePlugin: {title: 'Some page'}
  },
  '/some-other-page': {
    windowTitlePlugin: {
      title (router) {
        const {appStore} = router.app
        return `Some other page - ${appStore.someValue}`
      }
    }
  }
}
```

2. register the plugin

```js
// where you bootstrap your app_ (eg: Rootstore)
import MobxRouter from 'bard-router/src/mobx/MobxRouter'
import windowTitlePlugin from 'bard-router/src/plugins/windowTitlePlugin'

const router = new MobxRouter({...})

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

* __defaultTitle__ {string} - used as fallback for routes with undefined title
* __prefix__ {string} - Will be put in front of all your titles. (eg: app name)

In the example above, it means that the page title would look like: `Bard - Some page`
