# Plugins for bard-router

* [windowTitlePlugin](#windowTitlePlugin)
* [html5HistoryPlugin](#html5HistoryPlugin)
* [scrollPlugin](#scrollPlugin)
* [vmPlugin](#vmPlugin)

---

## windowTitlePlugin
<a name="windowTitlePlugin"></a>
Automatically sync the page title with the router state.

### How to use?

* Add a `windowTitlePlugin.title` field to any route config.
* _title_ can be either a `string` or a `function`.
* if it's a function, it will be called with the router as argument.

#### Example

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

### windowTitlePlugin options

* __defaultTitle__ {string} - used as fallback for routes with undefined title
* __prefix__ {string} - Will be put in front of all your titles. (eg: app name)

In the example above, it means that the page title would look like: `Bard - Some page`

---

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

---

## scrollPlugin
<a name="scrollPlugin"></a>

Simple plugin that manage the window scroll automatically when navigating.

Currently it resets the scroll back to top when navigating.  
It could be extended to restore scroll on going back. (ask in an issue)

---

## vmPlugin (experimental)
<a name="vmPlugin"></a>

_Not adding full documentation yet, it is experimental and could change or disappear. It is the most powerful plugin for the Bard ecosystem, that allows to greatly simplify a React app architecture._

The `vmPlugin` is meant to facilitate the [decouple state and UI](https://hackernoon.com/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37) philosophy.

### What are VM (view models) for?

A "VM" is an adapter that takes business data and prepare / format / provide it to a UI component.  
This "bridge" allows to completely decouple UI from data.

At the same time a VM may contain UI specific state, like some element visibility, etc. Your UI components are really just templates while you keep 100% control over their behaviour and your data.


__Here is a usage summary:__

### 1. Register the plugin

```js
const rootStore = new RootStore()
const router = new Router({
  app: {
    rootStore, // <- will be available in any VM
  }
})
vmPlugin.register(router)
```

### 2. Make the router available through context

```js
// generally, where you bootstrap your app
import {Provider} from 'mobx-react'

reactDom.render(
  <Provider router={router}>
    <Component />
  </Provider>,
  document.getElementById('root')
)
```

### 3. Have some component displayed with `<Route/>`
```js
// MyComponent.js - a component that will use a VM for its data.
function MyComponent (props) {
  const {vm} = props
  return <div>{vm.someData}</div>
}

export default observer(MyComponent)

// App.js - displays MyComponent when user navigates to '/my-component'
function App () {
  return (
    <div><Route path="/my-component" Component={MyComponent}/></div>
  )
}
```

### 4. Define the "view model" that your component needs
```js
class MyComponentVM {
  @observable someData = '...'
  // some actions, etc...

  constructor (rootStore) {
    // the VM will receive the rootStore and thus can access the app business models.
    this.rootStore = rootStore
  }
}
```

### 5. Configure the route with the plugin options

```js
import MyComponentVM from './MyComponentVM'

// routes.js
export default {
  '/': {},
  '/my-component': {
    vmPlugin: {vmClass: MyComponentVM},
  }
}
```

That's all. No need to learn exotic API's like "hooks" or "useState" or lifecycle methods, or other complicated state management to build UI.

__The gist of it__

`Component(vm(rootStore)) => UI`
