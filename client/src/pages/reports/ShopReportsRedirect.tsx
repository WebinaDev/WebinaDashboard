import { Navigate } from 'react-router-dom'

/** Legacy `/orders/reports` → `/reports/overview`. */
export default function ShopReportsRedirect() {
  return <Navigate to="/reports/overview" replace />
}
