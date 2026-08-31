import { useLocation, Navigate } from "react-router-dom"
import MerchantCard from "@/components/common/MerchantCard"
import type { Merchant } from "../types/merchant"

function SearchMerchantsAll() {
  const location = useLocation()
  const merchants: Merchant[] = location.state?.merchants

  if (!merchants) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">
        All Merchants ({merchants.length})
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {merchants.map((merchant) => (
          <MerchantCard key={merchant._id} merchant={merchant} />
        ))}
      </div>
    </div>
  )
}

export default SearchMerchantsAll
