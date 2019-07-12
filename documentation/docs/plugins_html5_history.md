---
id: plugins_html5_history
title: "Html5 history plugin"
sidebar_label: "Html5 history plugin"
---

> **Synchronize the router with the browser history / URL.**

You simply need to use the `html5HistoryPlugin`. Under the hood, it is using [ReactTraining history](https://github.com/ReactTraining/history).

**You need to have [history](https://github.com/ReactTraining/history) in your dependencies.**

```shell
> npm install history
```

Here is an example using ES6 and the MobxRouter.

```js
import {Router} from 'bard-router'
import html5HistoryPlugin from 'bard-router/lib/plugins/html5HistoryPlugin'

const router = new Router(/*...*/)
html5HistoryPlugin.register(router)
```

If needed, you can access the `history` instance returned by [createBrowserHistory](https://github.com/ReactTraining/history#usage) at `router.history`.
