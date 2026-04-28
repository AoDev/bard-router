import {defineConfig} from 'vitepress'

export default defineConfig({
  title: 'Bard mobx router',
  description: 'Type-safe React + MobX router with simple navigation APIs, hooks, and extensible plugins.',
  base: '/bard-router/',
  themeConfig: {
    nav: [
      {text: 'Guide', link: '/'},
      {text: 'GitHub', link: 'https://github.com/AoDev/bard-router'},
    ],
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: 'Router and hooks',
        items: [
          {text: 'Getting started', link: '/getting-started'},
          {text: 'Route specific hooks', link: '/route-hooks'},
          {text: 'Router hooks', link: '/router-hooks'},
        ],
      },
      {
        text: 'React UI Components',
        items: [
          {text: 'Route component', link: '/component-route'},
          {text: 'Link component', link: '/component-link'},
        ],
      },
      {
        text: 'Plugins',
        items: [
          {text: 'Scroll plugin', link: '/plugins-scroll'},
          {text: 'Window title plugin', link: '/plugins-window-title'},
          {text: 'Html5 history plugin', link: '/plugins-html5-history'},
        ],
      },
      {
        text: 'More info',
        items: [
          {text: 'FAQ', link: '/faq'},
          {text: 'Philosophy', link: '/about-router'},
        ],
      },
    ],
  },
})
