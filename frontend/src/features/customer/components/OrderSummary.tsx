import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Clock10, FileText, ShieldCheck } from "lucide-react"
import type { OrderSummary } from "../types/order"
import { Button } from "@/components/ui/button"
import { useAddCartNote } from "../hooks/useAddCartNote"
import { useEffect, useRef, useState } from "react"

function OrderSummary({
  subtotal,
  deliveryFee,
  totalItems,
  total,
  deliveryTime,
  customerNote,
  isMerchantOpen,
  cartId,
}: OrderSummary) {
  const [note, setNote] = useState(customerNote || "")
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  )

  const lastSavedNote = useRef(customerNote || "")

  const { mutate: addCustomerNote, isPending: isSavingCustomerNote } =
    useAddCartNote()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNote(customerNote || "")
    lastSavedNote.current = customerNote || ""
  }, [customerNote])

  useEffect(() => {
    if (noteStatus === "saved") {
      const timer = setTimeout(() => setNoteStatus("idle"), 3000)
      return () => clearTimeout(timer)
    }
  }, [noteStatus])

  const handleBlur = () => {
    const cleanNote = note.trim()

    if (cleanNote === lastSavedNote.current || !cartId) {
      return
    }

    setNoteStatus("saving")

    addCustomerNote(
      { note: cleanNote, cartId },
      {
        onSuccess: () => {
          lastSavedNote.current = cleanNote
          setNoteStatus("saved")
        },
        onError: () => {
          setNoteStatus("idle")
        },
      }
    )
  }

  return (
    <div className="">
      <h1 className="mb-2 ml-1 text-lg font-semibold">Order Summary</h1>
      <div className="flex h-170 flex-col items-start justify-start gap-5 rounded-md border border-muted-foreground/10 bg-background/20 p-5 shadow-xs">
        <div className="flex w-full flex-col justify-center gap-2">
          <div className="flex flex-row items-center justify-between">
            {totalItems && (
              <span className="text-xs text-muted-foreground md:text-sm">
                Subtotal ({totalItems} {totalItems > 1 ? "items" : "item"})
              </span>
            )}
            <span className="md:text-md text-sm font-semibold">
              ₱{subtotal}
            </span>
          </div>

          <div className="flex flex-row items-center justify-between">
            <span className="text-xs text-muted-foreground md:text-sm">
              Delivery fee
            </span>
            <span className="md:text-md text-sm font-semibold">
              ₱{deliveryFee}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex w-full flex-col justify-center gap-5">
          <div className="flex flex-row items-center justify-between">
            <span className="text-md font-semibold lg:text-lg">Total</span>
            <span className="text-lg font-semibold text-primary lg:text-xl">
              ₱{total}
            </span>
          </div>
          <div className="mb-5 flex w-full flex-col items-center justify-center gap-2">
            <Button
              className={`text-md flex w-full cursor-pointer flex-row items-center justify-center rounded-md py-6 font-normal ${!isMerchantOpen ? "bg-muted-foreground/40" : ""}`}
              disabled={!isMerchantOpen}
            >
              <span className="md:text-md text-sm lg:text-lg">
                Proceed to checkout
              </span>
              <ArrowRight />
            </Button>
            {!isMerchantOpen && (
              <p className="text-xs text-destructive md:text-sm">
                Merchant is closed
              </p>
            )}
          </div>
          <div className="mb-5 flex flex-row items-center justify-start gap-4 rounded-md bg-secondary p-4">
            <Clock10 />
            <div className="flex flex-col items-start justify-center gap-1">
              <p className="text-xs text-muted-foreground lg:text-sm">
                Estimated Delivery Time
              </p>
              {deliveryTime ? (
                <p className="lg:text-md text-sm font-semibold">
                  {deliveryTime} - {deliveryTime + 15} mins
                </p>
              ) : (
                <p className="lg:text-md text-sm font-semibold">
                  Something went wrong on getting the necessary data
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start justify-center gap-2">
            <p className="flex flex-row gap-2 text-xs text-muted-foreground/50 lg:text-sm">
              <FileText className="size-5" />
              Add your intructions here (optional)
            </p>
            <Textarea
              placeholder="Type here..."
              className="lg:text-md line-clamp-5 resize-none text-sm"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleBlur}
              disabled={isSavingCustomerNote}
            />
            <div className="flex w-full flex-row items-center justify-between">
              <span className="lg:text-md text-xs text-muted-foreground/40">
                {noteStatus === "saving" || isSavingCustomerNote
                  ? "Saving..."
                  : noteStatus === "saved"
                    ? "Saved"
                    : ""}
              </span>

              <span className="text-xs text-muted-foreground/40 lg:text-sm">
                {note.length}/500
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center justify-start gap-2 rounded-md bg-muted-foreground/10 px-4 py-3">
            <ShieldCheck className="size-8" color="#ff6b00" />
            <div className="flex flex-col items-start justify-center">
              <p className="lg:text-md text-sm font-semibold">
                Secure & safe checkout
              </p>
              <p className="lg:text-md text-sm text-muted-foreground">
                Your information is always protected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
