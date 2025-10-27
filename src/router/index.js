import { createRouter, createWebHistory } from 'vue-router'
import { productDB } from '@/utils/db'
import { initializeSampleData } from '@/utils/initDB'

const router = createRouter({
  history: createWebHistory(process.env.NODE_ENV === 'production' ? '/' : '/'),
  routes: [
    {
      path: '/',
      name: 'Products',
      component: () => import('@/components/product/ProductList.vue')
    },
    {
      path: '/products',
      name: 'ProductLists',
      component: () => import('@/components/product/ProductList.vue'),
      children: [
        {
          path: '',
          name: 'ProductList',
          component: () => import('@/components/product/ProductList.vue')
        },
        {
          path: 'add',
          name: 'ProductAdd',
          component: () => import('@/components/product/ProductForm.vue')
        },
        {
          path: 'edit/:id',
          name: 'ProductEdit',
          component: () => import('@/components/product/ProductForm.vue'),
          props: true
        }
      ]
    }
  ]
})

// Initialize database before navigation
router.beforeEach(async (to, from, next) => {
  try {
    await productDB.init()
    await initializeSampleData()
    next()
  } catch (error) {
    console.error('Database initialization failed:', error)
    next()
  }
})

export default router