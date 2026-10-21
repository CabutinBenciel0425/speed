import { Separator } from "@/components/ui/separator"
import type { Order } from "@/types/order"
import { Dot } from "lucide-react"

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
            <span className="text-base font-bold">Total price to pay</span>
            <span className="text-xl font-bold text-primary">
              ₱ {order.pricing.subtotal.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      {/*Payment Method*/}
      {/* <div className="flex flex-col gap-2 py-2">
        <h2 className="text-base font-bold">Payment</h2>
        <div>
          <div className="flex flex-row items-center justify-evenly gap-4">
            <span className="flex flex-col items-center rounded-md border border-dashed border-primary px-4 py-2">
              <Banknote className="size-15 text-primary" />
              <span className="text-base font-semibold">Cash</span>
            </span>
            <span className="flex flex-col items-center rounded-md border border-dashed border-background px-4 py-2">
              <QrCode className="size-15" />
              <span className="text-base font-semibold">QRPh</span>
            </span>
          </div>
          {order.payment.method === "QRPh" && (
            <div>
              <Label>
                Reference #:
                <Input placeholder="Enter reference number" />
              </Label>
            </div>
          )}
        </div>
      </div> */}
    </div>
  )
}

export default OrderDetailSummary
