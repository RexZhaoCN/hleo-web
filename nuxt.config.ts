// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content'],
  runtimeConfig: {
    public: {
      // 通过读取环境配置，注入前端所使用的跨域 Cloudflare Worker 外部接口地址，方便替换和切换
      turnstileApiUrl: process.env.NUXT_PUBLIC_TURNSTILE_API_URL || 'https://qrcodeverifyapi.hleo.top'
    }
  },
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://oss1.236668.xyz/fonts/mojang/stylesheet.css' },
        { rel: 'stylesheet', href: 'https://oss1.236668.xyz/fonts/lxgw/LXGWWenKai-Regular/result.css' },
        { rel: 'stylesheet', href: 'https://oss1.236668.xyz/fonts/lxgw/LXGWWenKai-Light/result.css' },
        { rel: 'stylesheet', href: 'https://oss1.236668.xyz/fonts/lxgw/LXGWWenKai-Medium/result.css' }
      ],
      script: [
        {
          src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
          async: true,
          defer: true
        }
      ]
    }
  }
})
