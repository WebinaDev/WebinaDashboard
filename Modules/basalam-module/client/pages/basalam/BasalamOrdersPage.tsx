import { Navigate } from 'react-router-dom'

/** Basalam orders live in the WooCommerce orders list with marketplace filter. */
export default function BasalamOrdersPage() {
  return <Navigate to="/orders?marketplace=basalam" replace />
}
