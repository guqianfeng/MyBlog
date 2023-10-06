import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/MyBlog/',
  title: "梅利奥猪猪の窝",
  description: "梅利奥猪猪の窝",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Frontend', link: '/frontend' },
      { text: 'Cocos', link: '/cocos' },
      { text: 'FTG', link: '/ftg' },
    ],

    sidebar: [
      {
        text: 'Frontend',
        items: [
          { text: 'FrontendA', link: 'frontend/frontendA' },
          { text: 'FrontendB', link: 'frontend/frontendB' }
        ]
      },
      {
        text: 'cocos',
        items: [
          { text: 'cocosA', link: 'cocos/cocosA' },
          { text: 'cocosB', link: 'cocos/cocosB' }
        ]
      },
      {
        text: 'FTG',
        items: [
          { text: 'FTGA', link: 'ftg/ftgA' },
          { text: 'FTGB', link: 'ftg/ftgB' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/guqianfeng' }
    ]
  }
})
