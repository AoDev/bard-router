# `<Link/>` component

The Link component lets your users navigate through your UI.

`Link` gets two props: `to` and `params` that represents a routing request.

To help with typical UI patterns, you can automatically get an `active` CSS class on your link if it matches the current route, by setting the `autoActive` attribute.

You can manually control this behaviour by setting `active={true|false}`.

#### Link component example

```js
import React from 'react'
import {Link} from 'bard-router'

export function SomeTextWithLink() {
  return (
    <div>
      <h3>Do something</h3>
      <p>
        <Link autoActive to="/private/my-things" params={{id: 1}}>
          View your things
        </Link>
        .
      </p>
    </div>
  )
}
```
