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
  onHandleClick,
  open,
  onOpenChange,
}: {
  dialogTrigger: React.ReactNode
  order: Order
  onHandleClick: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogTrigger}

      <DialogContent
        showCloseButton={false}
        className="z-1100 duration-300 data-open:zoom-in-100 data-open:slide-in-from-bottom-8 data-closed:zoom-out-100 data-closed:slide-out-to-bottom-8 [[data-slot=dialog-overlay]:has(~_&)]:duration-300"
      >
        <DialogHeader className="border-b border-b-muted-foreground/30 py-2">
          <p className="text-lg font-bold">Confirm Pickup & Payment</p>
          <p className="text-lg font-bold text-primary">
            Order #{order.orderNumber}
          </p>
        </DialogHeader>

        <OrderDetailSummary order={order} />
        <DialogFooter className="flex flex-col! items-start gap-8">
          <Label className="flex flex-row items-start gap-2">
            <Checkbox />
            <p className="text-xs text-muted-foreground">
              I confirm that the above information are correct and I have
              received{" "}
              <span className="text-sm font-semibold text-primary">
                ₱ {order.pricing.total.toFixed(2)}
              </span>{" "}
              from the driver as payment for this order.
            </p>
          </Label>
          <div className="flex w-full flex-row gap-2">
            <Button
              className={"flex-1 cursor-pointer rounded-md py-4"}
              variant={"outline"}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className={"flex-1 cursor-pointer rounded-md py-4"}
              onClick={onHandleClick}
            >
              Confirm Pickup
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PickupConfirmationModal
