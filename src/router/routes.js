const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '/', component: () => import('pages/Dashboard.vue')},
      {path: '/commands', component: () => import('pages/Commands.vue')},
      {path: '/file/transfers', component: () => import('pages/FileTransfers.vue')},
      {path: '/eureka/applications', component: () => import('pages/EurekaApps.vue')},
      {path: '/env', component: () => import('pages/Environment.vue')},
      {path: '/contacts', component: () => import('pages/Contact.vue')}
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
