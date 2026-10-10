import { Trash2Icon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type React from "react"
import { Field, FieldLabel } from "../ui/field"
import { Textarea } from "../ui/textarea"

function CancelOrderModal({
  reason,
  onChangeReason,
  open,
  onOpenChange,
  onConfirm,
  title = "Cancel Order",
  description = "Are you sure you want to cancel this order? This action cannot be undone.",
  icon,
}: {
  reason?: string
  onChangeReason: (value: string) => void
  open: boolean
  onOpenChange: (value: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  icon?: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="duration-300 data-open:zoom-in-100 data-open:slide-in-from-bottom-8 data-closed:zoom-out-100 data-closed:slide-out-to-bottom-8 [[data-slot=dialog-overlay]:has(~_&)]:duration-300"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            {icon ? icon : <Trash2Icon size={20} />}
          </div>
          <DialogHeader className="items-center">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="flex w-full items-start">
            <Field>
              <FieldLabel>Cancellation Reason</FieldLabel>

              <Textarea
                placeholder="Type here..."
                value={reason}
                onChange={(event) => onChangeReason(event.target.value)}
              ></Textarea>
            </Field>
          </div>
          <div className="flex w-full gap-2">
            <DialogClose
              render={
                <Button variant="outline" className="flex-1 cursor-pointer" />
              }
            >
              Close dialog
            </DialogClose>
            <DialogClose
              render={
                <Button
                  variant="destructive"
                  className="flex-1 cursor-pointer"
                  onClick={onConfirm}
                />
              }
            >
              Cancel Order
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CancelOrderModal
