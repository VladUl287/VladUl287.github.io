import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/',
  title: "WebSocket.Otp",
  description: "A minimal WebSocket library for ASP.NET Core inspired by REPR principles.",
  themeConfig: {
    logo: '/icon.png',

    // head: [
    //   ['link', { rel: 'icon', type: 'image/png', href: '/icon.png' }],
    // ],

    nav: [
      { text: 'Docs', link: '/docs/quickstart' },
      // { text: 'Benchmarks', link: '/benchmarks' }
    ],

    sidebar: {
      '/docs': [
        {
          text: 'Getting started',
          items: [
            { text: 'Quick Start', link: '/docs/quickstart' },
          ],
        },
        {
          text: 'API',
          items: [
            { text: 'Endpoint Types', link: '/docs/endpointtypes' },
            { text: 'Authorization', link: '/docs/authorization' },              
            { text: 'Dependency Injection', link: '/docs/dependencyinjection' },
            { text: 'Serialization', link: '/docs/serialization' },
            { text: 'Connection Manager', link: '/docs/connectionmanager' },
            { text: 'Distributed Connections', link: '/docs/distributedconnection' },
            { text: 'JavaScript Client', link: '/docs/client' },
            // { text: 'Testing', link: '/docs/distributedconnection' },
            // { text: 'Error handling', link: '/docs/distributedconnection' },
            // { text: 'Telemetry', link: '/docs/distributedconnection' },
            // { text: 'Logging', link: '/docs/distributedconnection' },
          ],
        },
      ],
      // '/benchmarks': [
      //   {
      //     text: 'API',
      //     items: [
      //       { text: 'Functions', link: '/api/functions' },
      //       { text: 'Types', link: '/api/types' },
      //     ],
      //   },
      // ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/VladUl287/WebSoket.Otp' }
    ]
  }
})
