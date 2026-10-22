import { Check, CreditCard, PackageCheck, Wallet } from "lucide-react"
import type { DriverOrder } from "../types/driver"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

const money = (amount = 0) => `₱${amount.toFixed(2)}`

export default function DriverDeliveryCompleteDialog({
  order,
  onClose,
}: {
  order: DriverOrder | null
  onClose: () => void
}) {
  const itemsTotal = order?.pricing?.subtotal ?? 0
  const deliveryFee = order?.pricing?.deliveryFee ?? 0
  const wasPaidOnline = order?.payment?.status === "Paid"
  const amountToCollect = wasPaidOnline
    ? deliveryFee
    : (order?.pricing?.total ?? itemsTotal + deliveryFee)

  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <span className="mb-1 grid size-11 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
            <Check className="size-5" />
          </span>
          <DialogTitle>Delivery completed</DialogTitle>
          <DialogDescription>
            {order ? `Order #${order.orderNumber} has been delivered. Review the payment before closing.` : ""}
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4">
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><PackageCheck className="size-4" /> Items total</span>
                <span className="text-right font-medium">{money(itemsTotal)}<span className="mt-0.5 block text-xs font-normal text-muted-foreground">{wasPaidOnline ? "Paid online" : "Collect from customer"}</span></span>
              </div>
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Wallet className="size-4" /> Delivery fee</span>
                <span className="text-right font-medium">{money(deliveryFee)}<span className="mt-0.5 block text-xs font-normal text-muted-foreground">Driver earnings</span></span>
              </div>
              <Separator />
              <div className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2 font-semibold"><CreditCard className="size-4" /> Collect from customer</span>
                <span className="text-right text-lg font-semibold">{money(amountToCollect)}</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {wasPaidOnline
                ? "The item total has been paid online. Collect the delivery fee only."
                : "The items have not been paid yet. Collect the order total, including the delivery fee."}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
