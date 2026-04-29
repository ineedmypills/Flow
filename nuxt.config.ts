export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  modules: [
    'nuxt-auth-utils',
    '@nuxtjs/i18n'
  ],

  i18n: {
    locales: [
      { code: 'ru', iso: 'ru-RU', file: 'ru.json', name: 'Русский' }
    ],
    defaultLocale: 'ru',
    lazy: true,
    langDir: 'locales',
    strategy: 'prefix_except_default'
  },

  css: [
    '~/assets/css/main.css'
  ],

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  runtimeConfig: {
    // Session secret for nuxt-auth-utils
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || 'a-very-long-and-secure-password-that-is-at-least-32-chars'
    }
  },

  app: {
    head: {
      title: 'Flow - Video Hosting',
      meta: [
        { name: 'description', content: 'Modern video hosting platform' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;800&display=swap' }
      ]
    }
  }
})
