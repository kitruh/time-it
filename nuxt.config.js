
export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {rel:"stylesheet", href:"//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons"}
    ],
    script: [
      {src:"https://kit.fontawesome.com/6d22836f9a.js", crossorigin:"anonymous"},

      {"data-ad-client":"ca-pub-5363460947226243",
        async: "async",
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'}
    ],
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
      '@nuxtjs/axios',
    '@nuxtjs/auth'],

  axios: {
    baseUrl: 'http://localhost:3000/api'
  },

  auth: {
    strategies: {
      google: {
        client_id: '131447866697-aakrlen9rlfe495rhn65b8m9hir143fg.apps.googleusercontent.com'
      },
      local: {
        endpoints: {
          login: {url: '/sessions', method: 'post', propertyName: 'token'}
        }
      }
    }
  },
  router: {
    middleware: ['auth']
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
