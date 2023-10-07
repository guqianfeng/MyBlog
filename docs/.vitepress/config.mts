import { defineConfig } from 'vitepress'
import { native } from './router/frontend/native.mjs'
import { framework } from './router/frontend/framework.mjs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/MyBlog/',
  title: "梅利奥猪猪の窝",
  description: "梅利奥猪猪の窝",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { 
        text: 'Frontend', 
        items: [
          {
            text: 'native',
            link: '/frontend/native/index.md'
          },
          {
            text: 'framework',
            link: '/frontend/framework/index.md'
          }
        ]
      },
      { text: 'Cocos', link: '/cocos/index.md' },
      { text: 'Game', link: '/game/index.md' },
    ],

    sidebar: {
      '/frontend/native/': native,
      '/frontend/framework/': framework,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/guqianfeng' }
    ]
  }
})
