/**
 * Syncs React Router location to pageContextStore
 * Also resolves product from PDP slugs
 */
import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { usePageContextStore } from '../stores/usePageContextStore'
import { getProductById } from '../data/products'

export function usePageContext() {
  const location = useLocation()
  const setPage = usePageContextStore((s) => s.setPage)
  const setViewingProduct = usePageContextStore((s) => s.setViewingProduct)
  const setViewingCategory = usePageContextStore((s) => s.setViewingCategory)
  const clearViewingProduct = usePageContextStore((s) => s.clearViewingProduct)

  useEffect(() => {
    const path = location.pathname

    // Detect page type from URL
    if (path === '/') {
      setPage('home', path)
      clearViewingProduct()
      setViewingCategory(null)
    } else if (path.startsWith('/product/')) {
      const slug = path.split('/product/')[1]
      const product = getProductById(slug)
      setPage('pdp', path)
      if (product) {
        setViewingProduct(product)
      }
      setViewingCategory(null)
    } else if (path.startsWith('/shop')) {
      const category = path.split('/shop/')[1] || null
      setPage('plp', path)
      clearViewingProduct()
      setViewingCategory(category)
    } else if (path === '/cart') {
      setPage('cart', path)
      clearViewingProduct()
    } else if (path === '/checkout') {
      setPage('checkout', path)
      clearViewingProduct()
    } else if (path.startsWith('/account')) {
      setPage('account', path)
      clearViewingProduct()
    } else if (path === '/wishlist') {
      setPage('wishlist', path)
      clearViewingProduct()
    } else {
      setPage('other', path)
      clearViewingProduct()
    }
  }, [location.pathname])
}
