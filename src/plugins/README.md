# Plugins for bard-router

* [windowTitlePlugin](#windowTitlePlugin)
* [html5HistoryPlugin](#html5HistoryPlugin)

## windowTitlePlugin
<a name="windowTitlePlugin"></a>
Automatically sync the page title with the router state.

### How to use?

* Add a `data.title` field to any route config.
* _title_ can be either a `string` or a `function`.
* if it's a function, it will be called with the router as argument.

#### Example

1. route configs
```js
{
  '/some-page': {
    data: {title: 'Some page'}
  },
  '/some-other-page': {
    data: {
      title (router) {
        const {appStore} = router.app
        return `Some other page - ${appStore.someValue}`
      }
    }
  }
}
```

2. __where you bootstrap your app__ (eg: Rootstore)
```js
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

### windowTitlePlugin options

* __defaultTitle__ {string} - used as fallback for routes with undefined title
* __prefix__ {string} - Will be put in front of all your titles. (eg: app name)

In the example above, it means that the page title would look like: `Bard - Some page`


## html5HistoryPlugin
<a name="html5HistoryPlugin"></a>

You can synchronize the router with the browser history / URL.  
You simply need to use the `html5HistoryPlugin`. Under the hood, it is using [ReactTraining history](https://github.com/ReactTraining/history).

Here is an example using ES6 and the MobxRouter.

```js
import MobxRouter from 'bard-router/src/mobx/MobxRouter'
import html5HistoryPlugin from 'bard-router/src/plugins/html5HistoryPlugin'

const router = new MobxRouter(/*...*/)
html5HistoryPlugin.register(router)
```

If needed, you can access the `history` instance of [createBrowserHistory from ReactTraining history](https://github.com/ReactTraining/history#usage) at `router.history`.
