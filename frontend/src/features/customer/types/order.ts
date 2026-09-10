export type OrderSummary = {
  subtotal: number | undefined
  deliveryFee: number | undefined
  total: number | undefined
  totalItems: number | undefined
  deliveryTime: number | undefined
  customerNote: string | undefined
  onChangeCustomerNote: (value: string) => void
  isMerchantOpen: boolean | undefined
}
