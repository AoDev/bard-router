---
id: about_router
title: Philosophy
sidebar_label: Philosophy
---

**You can always fix a bug in a library, but a bad architecture will turn your entire project into Hell.**

With that in mind, I have been on a never ending quest to find a simple but effective architecture to easily build mobx / react apps in particular. The journey so far has lead me to the following three points for a happy developer experience.

## App architecture design fundamentals

Note: these principles can be applied to any kind of software, `Bard router` was made to allow such implementations in a react / mobx context.

### Clean architecture by Robert C. Martin (Uncle Bob)

> “By separating the software into layers, and conforming to The Dependency Rule, you will create a system that is intrinsically testable, with all the benefits that implies.”

[Link to Robert site](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Decouple state and UI by mobx author

> "Strategies for dealing with routing, data fetching, authentication and workflow testing without the UI layer."

[Link to Michel Weststrate article](https://hackernoon.com/how-to-decouple-state-and-ui-a-k-a-you-dont-need-componentwillmount-cc90b787aa37)

### App shell architecture

> "An application shell (or app shell) architecture is one way to build a Progressive Web App that reliably and instantly loads on your users' screens, similar to what you see in native applications."

[Link to developer.google.com](https://developers.google.com/web/fundamentals/architecture/app-shell)
