import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Order } from "@/types/order"
import { Banknote, Dot, QrCode } from "lucide-react"

function OrderDetailSummary({ order }: { order: Order }) {
  return (
    <div>
      {/*Driver*/}
      <div>
        <h2>Driver</h2>
        <div>
          <img src={order.driver?.avatar} alt={order.driver?.user.firstName} />
          <div>
            <p>
              {order.driver?.user.firstName} {order.driver?.user.lastName}
            </p>
            <p>
              <span>{order.driver?.vehicleType}</span>
              <Dot />
              <span>{order.driver?.plateNumber}</span>
            </p>
          </div>
        </div>
      </div>

      {/*Items*/}
      <div className="divide-y px-2">
        <div>
          <h2>Items</h2>
          <div>
            <p className="flex w-full flex-row items-center justify-between">
              <span>1 x Vanilla Bean Frappe</span>
              <span>₱195.00</span>
            </p>
            <p className="flex w-full flex-row items-center justify-between">
              <span>2 x Mango Shake</span>
              <span>₱150.00</span>
            </p>
          </div>
        </div>
        <div>
          <p className="flex w-full flex-row items-center justify-between">
            <span>Amount driver pays you</span>
            <span>₱495.00</span>
          </p>
        </div>
      </div>

      {/*Payment Method*/}
      <div>
        <h2>Payment</h2>
        <div>
          <div>
            <span>
              <Banknote />
              <span>Cash</span>
            </span>
            <span>
              <QrCode />
              <span>QRPh</span>
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
      </div>
    </div>
  )
}

export default OrderDetailSummary
