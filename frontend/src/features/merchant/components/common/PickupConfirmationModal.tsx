import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import type React from "react"
import OrderDetailSummary from "./OrderDetailSummary"
import type { Order } from "@/types/order"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function PickupConfirmationModal({
  dialogTrigger,
  order,
}: {
  dialogTrigger: React.ReactNode
  order: Order
}) {
  return (
    <Dialog>
      {dialogTrigger}

      <DialogContent
        showCloseButton={false}
        className="z-1100 divide-y duration-300 data-open:zoom-in-100 data-open:slide-in-from-bottom-8 data-closed:zoom-out-100 data-closed:slide-out-to-bottom-8 [[data-slot=dialog-overlay]:has(~_&)]:duration-300"
      >
        <DialogHeader>
          <p>Confirm Pickup & Payment</p>
          <p>Order #{order.orderNumber}</p>
        </DialogHeader>
        <OrderDetailSummary order={order} />
        <DialogFooter>
          <Label>
            <Checkbox />
            <span>I received ₱230.00 from the driver</span>
          </Label>
          <div>
            <Button>Cancel</Button>
            <Button>Confirm Pickup</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PickupConfirmationModal
