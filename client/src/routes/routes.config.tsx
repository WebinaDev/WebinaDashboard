import type { ComponentType, LazyExoticComponent } from 'react'

import { lazyPage } from '@/routes/lazyPage'

export type DashboardRouteDef = {
  path: string
  capability: string
  /** i18n key for `SiteHeader`; optional `headerParamKeys` maps :params to interpolation names */
  headerTitleKey?: string
  headerParamKeys?: Record<string, string>
  Component: LazyExoticComponent<ComponentType>
}

export const dashboardRoutes: DashboardRouteDef[] = [
  {
    path: 'magazine/posts',
    capability: 'edit_posts',
    headerTitleKey: 'posts.title',
    Component: lazyPage(() => import('@/pages/magazine/PostsListPage')),
  },
  {
    path: 'magazine/new',
    capability: 'edit_posts',
    headerTitleKey: 'posts.newTitle',
    Component: lazyPage(() => import('@/pages/magazine/PostEditorPage')),
  },
  {
    path: 'magazine/posts/:postId',
    capability: 'edit_posts',
    headerTitleKey: 'posts.editTitle',
    Component: lazyPage(() => import('@/pages/magazine/PostEditorPage')),
  },
  {
    path: 'magazine/categories',
    capability: 'manage_categories',
    headerTitleKey: 'categories.title',
    Component: lazyPage(() => import('@/pages/magazine/CategoriesPage')),
  },
  {
    path: 'media',
    capability: 'upload_files',
    headerTitleKey: 'media.title',
    Component: lazyPage(() => import('@/pages/MediaLibraryPage')),
  },
  {
    path: 'media/folders',
    capability: 'upload_files',
    headerTitleKey: 'media.foldersTitle',
    Component: lazyPage(() => import('@/pages/MediaFoldersPage')),
  },
  {
    path: 'media/categories',
    capability: 'upload_files',
    headerTitleKey: 'media.categoriesTitle',
    Component: lazyPage(() => import('@/pages/MediaCategoriesPage')),
  },
  {
    path: 'pages',
    capability: 'edit_pages',
    headerTitleKey: 'pages.title',
    Component: lazyPage(() => import('@/pages/cms/PagesListPage')),
  },
  {
    path: 'pages/new',
    capability: 'edit_pages',
    headerTitleKey: 'pages.newTitle',
    Component: lazyPage(() => import('@/pages/cms/PageEditorPage')),
  },
  {
    path: 'pages/:pageId',
    capability: 'edit_pages',
    headerTitleKey: 'pages.editTitle',
    Component: lazyPage(() => import('@/pages/cms/PageEditorPage')),
  },
  {
    path: 'shop/products',
    capability: 'edit_products',
    headerTitleKey: 'products.title',
    Component: lazyPage(() => import('@/pages/shop/ProductsListPage')),
  },
  {
    path: 'shop/products/new',
    capability: 'edit_products',
    headerTitleKey: 'products.newTitle',
    Component: lazyPage(() => import('@/pages/shop/ProductEditorPage')),
  },
  {
    path: 'shop/products/:productId',
    capability: 'edit_products',
    headerTitleKey: 'products.editTitle',
    Component: lazyPage(() => import('@/pages/shop/ProductEditorPage')),
  },
  {
    path: 'shop/brands',
    capability: 'manage_product_terms',
    headerTitleKey: 'brands.title',
    Component: lazyPage(() => import('@/pages/shop/BrandsPage')),
  },
  {
    path: 'shop/brands/new',
    capability: 'manage_product_terms',
    headerTitleKey: 'brands.newTitle',
    Component: lazyPage(() => import('@/pages/shop/BrandEditorPage')),
  },
  {
    path: 'shop/brands/:brandId',
    capability: 'manage_product_terms',
    headerTitleKey: 'brands.editTitle',
    Component: lazyPage(() => import('@/pages/shop/BrandEditorPage')),
  },
  {
    path: 'shop/product-categories',
    capability: 'manage_product_terms',
    headerTitleKey: 'productCats.title',
    Component: lazyPage(() => import('@/pages/shop/ProductCategoriesPage')),
  },
  {
    path: 'shop/product-categories/new',
    capability: 'manage_product_terms',
    headerTitleKey: 'productCats.newTitle',
    Component: lazyPage(() => import('@/pages/shop/ProductCategoryEditorPage')),
  },
  {
    path: 'shop/product-categories/:categoryId',
    capability: 'manage_product_terms',
    headerTitleKey: 'productCats.editTitle',
    Component: lazyPage(() => import('@/pages/shop/ProductCategoryEditorPage')),
  },
  {
    path: 'shop/attributes',
    capability: 'manage_product_terms',
    headerTitleKey: 'attributes.title',
    Component: lazyPage(() => import('@/pages/shop/AttributesPage')),
  },
  {
    path: 'shop/attributes/new',
    capability: 'manage_product_terms',
    headerTitleKey: 'attributes.newTitle',
    Component: lazyPage(() => import('@/pages/shop/AttributeEditorPage')),
  },
  {
    path: 'shop/attributes/:attributeId',
    capability: 'manage_product_terms',
    headerTitleKey: 'attributes.editTitle',
    Component: lazyPage(() => import('@/pages/shop/AttributeEditorPage')),
  },
  {
    path: 'orders/list',
    capability: 'edit_shop_orders',
    headerTitleKey: 'orders.title',
    Component: lazyPage(() => import('@/pages/orders/OrdersListPage')),
  },
  {
    path: 'orders/list/:orderId',
    capability: 'edit_shop_orders',
    headerTitleKey: 'orders.detailTitle',
    headerParamKeys: { orderId: 'id' },
    Component: lazyPage(() => import('@/pages/orders/OrderDetailPage')),
  },
  {
    path: 'orders/reports',
    capability: 'view_woocommerce_reports',
    headerTitleKey: 'reports.title',
    Component: lazyPage(() => import('@/pages/orders/SalesReportsPage')),
  },
  {
    path: 'marketing/coupons',
    capability: 'edit_shop_coupons',
    headerTitleKey: 'coupons.title',
    Component: lazyPage(() => import('@/pages/marketing/CouponsListPage')),
  },
  {
    path: 'marketing/coupons/new',
    capability: 'edit_shop_coupons',
    headerTitleKey: 'coupons.newTitle',
    Component: lazyPage(() => import('@/pages/marketing/CouponEditorPage')),
  },
  {
    path: 'marketing/coupons/:couponId',
    capability: 'edit_shop_coupons',
    headerTitleKey: 'coupons.editTitle',
    Component: lazyPage(() => import('@/pages/marketing/CouponEditorPage')),
  },
  {
    path: 'users/list',
    capability: 'list_users',
    headerTitleKey: 'users.title',
    Component: lazyPage(() => import('@/pages/users/UsersListPage')),
  },
  {
    path: 'users/new',
    capability: 'create_users',
    headerTitleKey: 'users.createTitle',
    Component: lazyPage(() => import('@/pages/users/UserDetailPage')),
  },
  {
    path: 'users/comments',
    capability: 'moderate_comments',
    headerTitleKey: 'comments.title',
    Component: lazyPage(() => import('@/pages/users/CommentsPage')),
  },
  {
    path: 'users/:userId',
    capability: 'edit_users',
    headerTitleKey: 'users.editTitle',
    headerParamKeys: { userId: 'login' },
    Component: lazyPage(() => import('@/pages/users/UserDetailPage')),
  },
  {
    path: 'marketplace',
    capability: 'manage_options',
    headerTitleKey: 'marketplace.title',
    Component: lazyPage(() => import('@/pages/marketplace/MarketplacePage')),
  },
  {
    path: 'marketplace/installed',
    capability: 'manage_options',
    headerTitleKey: 'marketplace.myModulesTitle',
    Component: lazyPage(() => import('@/pages/marketplace/MyModulesPage')),
  },
  {
    path: 'marketplace/payment-callback',
    capability: 'manage_options',
    headerTitleKey: 'marketplace.paymentCallback',
    Component: lazyPage(() => import('@/pages/marketplace/MarketplacePaymentCallbackPage')),
  },
  {
    path: 'settings',
    capability: 'manage_options',
    headerTitleKey: 'settings.hub.title',
    Component: lazyPage(() => import('@/pages/settings/SettingsHubPage')),
  },
  {
    path: 'settings/site/:section',
    capability: 'manage_options',
    headerTitleKey: 'settings.site.title',
    Component: lazyPage(() => import('@/pages/settings/site/SettingsSiteShell')),
  },
  {
    path: 'settings/shop/pricing/:tab',
    capability: 'edit_products',
    headerTitleKey: 'settings.shop.sections.pricing',
    headerParamKeys: { tab: 'tab' },
    Component: lazyPage(() => import('@/pages/settings/shop/SettingsShopPricingPage')),
  },
  {
    path: 'settings/shop/:section',
    capability: 'manage_woocommerce',
    headerTitleKey: 'settings.shop.title',
    Component: lazyPage(() => import('@/pages/settings/shop/SettingsShopShell')),
  },
  {
    path: 'settings/shop/ext/:moduleSlug',
    capability: 'manage_woocommerce',
    headerTitleKey: 'marketplace.moduleSettingsTitle',
    Component: lazyPage(() => import('@/pages/settings/ModuleSettingsShell')),
  },
]
