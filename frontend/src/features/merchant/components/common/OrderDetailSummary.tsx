import { Separator } from "@/components/ui/separator"
import type { Order } from "@/types/order"
import { Dot, QrCode, Wallet } from "lucide-react"

function OrderDetailSummary({ order }: { order: Order }) {
  return (
    <div>
      {/*Driver*/}
      <div className="flex flex-col gap-2 border-b border-b-muted-foreground/30 pb-6">
        <h2 className="text-base font-bold">Driver</h2>
        <div className="flex flex-row items-center gap-4">
          <img
            src={order.driver?.avatar}
            alt={order.driver?.user.firstName}
            className="h-20 w-20 rounded-full"
          />
          <div className="flex flex-col gap-2">
            <p className="text-semibold text-base">
              {order.driver?.user.firstName} {order.driver?.user.lastName}
            </p>
            <p className="flex flex-row">
              <span className="text-muted-foreground">
                {order.driver?.vehicleType}
              </span>
              <Dot />
              <span className="font-semibold">{order.driver?.plateNumber}</span>
            </p>
          </div>
        </div>
      </div>

      {/*Items*/}
      <div className="flex flex-col gap-2 pt-2">
        <h2 className="text-base font-bold">Items</h2>

        <div>
          {order.items.map((item) => (
            <p className="flex w-full flex-row items-center justify-between py-1 text-sm text-muted-foreground">
              <span>
                {item.quantity} x {item.productName}
              </span>
              <span>₱ {item.subtotal.toFixed(2)}</span>
            </p>
          ))}
        </div>
        <Separator />
        <div className="py-3">
          <p className="flex w-full flex-row items-center justify-between">
            <span className="text-base font-bold">Total to pay</span>
            <span className="text-xl font-bold text-primary">
              ₱ {order.pricing.total.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          {order.payment.method === "QRPh" ? (
            <QrCode className="size-4" />
          ) : (
            <Wallet className="size-4" />
          )}
          {order.payment.method === "QRPh"
            ? "QR Ph paid online"
            : "Cash on delivery"}
        </span>
        <span className="font-medium">{order.payment.status}</span>
      </div>
    </div>
  )
}

export default OrderDetailSummary
