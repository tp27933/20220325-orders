const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        name: 'Login',
        path: "/login",
        component: () => import("pages/Login.vue")
      },
      {
        name: 'Index',
        path: "/index",
        component: () => import("pages/Index.vue")
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
