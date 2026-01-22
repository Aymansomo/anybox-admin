import { Suspense } from "react"
import OrdersPageContent from "./orders-content"

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersPageContent />
    </Suspense>
  )
}
