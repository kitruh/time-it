export default {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || "",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href:
          "//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons"
      }
    ],
    script: [
      {
        src: "https://kit.fontawesome.com/6d22836f9a.js",
        crossorigin: "anonymous"
      },

      {
        "data-ad-client": "ca-pub-5363460947226243",
        async: "async",
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [],
  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/axios", "@nuxtjs/auth"],

  // auth: {
  //   strategies: {
  //     google: {
  //       client_id:
  //         "456651353888-9se35a5sgmmhlrdjemqc03oe00fi2lsn.apps.googleusercontent.com",
  //       client_secret: "SwJMolhT1Wd-lMRkoYqxqIIy"
  //     }
  //   }
  // },
  router: {
    // middleware: ['auth']
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
};
