---
id: plugins_scroll
title: Scroll plugin
sidebar_label: Scroll plugin
---

> **Simple plugin that manages the window scroll automatically when navigating.**

Currently it resets the scroll back to top when navigating.  
It could be extended to restore scroll on going back. (ask in an issue)

```js
import {Router, scrollPlugin} from 'bard-router'

const router = new Router(/*...*/)
scrollPlugin.register(router)
```
