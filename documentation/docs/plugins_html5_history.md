---
id: plugins_html5_history
title: "Html5 history plugin"
sidebar_label: "Html5 history plugin"
---

> **Synchronize the router with the browser history / URL.**

You simply need to use the `html5HistoryPlugin`. Under the hood, it is using [ReactTraining history](https://github.com/ReactTraining/history).

Here is an example using ES6 and the MobxRouter.

```js
import MobxRouter from 'bard-router/src/mobx/MobxRouter'
import html5HistoryPlugin from 'bard-router/src/plugins/html5HistoryPlugin'

const router = new MobxRouter(/*...*/)
html5HistoryPlugin.register(router)
```

If needed, you can access the `history` instance of [createBrowserHistory from ReactTraining history](https://github.com/ReactTraining/history#usage) at `router.history`.