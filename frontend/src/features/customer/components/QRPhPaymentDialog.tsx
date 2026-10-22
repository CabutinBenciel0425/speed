import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  QrCode,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useQRPhPaymentStatus } from "../hooks/usePlaceOrderQRPh"
import type { QRPhPaymentResponseType } from "../hooks/usePlaceOrderQRPh"

export default function QRPhPaymentDialog({
  payment,
  open,
  onDismiss,
  onClose,
  onGenerateNewQR,
  isGeneratingQR,
}: {
  payment: QRPhPaymentResponseType | null
  open: boolean
  onDismiss: () => void
  onClose: () => void
  onGenerateNewQR: () => void
  isGeneratingQR: boolean
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [secondsLeft, setSecondsLeft] = useState(0)
  const statusQuery = useQRPhPaymentStatus(payment?.paymentId ?? "", !!payment)
  const paymentStatus = statusQuery.data?.status ?? "Pending"
  const isAwaitingPayment =
    paymentStatus === "Pending" ||
    paymentStatus === "GeneratingQR" ||
    paymentStatus === "Processing"

  useEffect(() => {
    if (!payment) return
    const updateRemaining = () => {
      setSecondsLeft(
        Math.max(
          0,
          Math.ceil((new Date(payment.expiresAt).getTime() - Date.now()) / 1000)
        )
      )
    }
    updateRemaining()
    const timer = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(timer)
  }, [payment])

  useEffect(() => {
    if (paymentStatus !== "Paid" || !statusQuery.data?.order) return
    void queryClient.invalidateQueries({ queryKey: ["cart"] })
    void queryClient.invalidateQueries({ queryKey: ["customerOrders"] })
    toast.success("Payment confirmed. Your order is being placed.")
    navigate(`/orders/tracking/${statusQuery.data.order}`, { replace: true })
  }, [navigate, paymentStatus, queryClient, statusQuery.data?.order])

  const imageSrc = payment?.qrCodeImage?.startsWith("data:")
    ? payment.qrCodeImage
    : `data:image/png;base64,${payment?.qrCodeImage ?? ""}`
  const expired = paymentStatus === "Expired" || paymentStatus === "Failed"
  const qrExpiredLocally =
    !!payment &&
    secondsLeft <= 0 &&
    Date.now() >= new Date(payment.expiresAt).getTime()
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, "0")

  return (
    <Dialog
      open={!!payment && open}
      onOpenChange={(open) => {
        if (open) return
        if (isAwaitingPayment && secondsLeft <= 0) onDismiss()
        else if (expired) onClose()
      }}
    >
      <DialogContent
        showCloseButton={expired}
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
      >
        <DialogHeader className="items-center text-center">
          <span className="grid size-11 place-items-center rounded-2xl border bg-muted/50 text-primary">
            {expired || qrExpiredLocally ? (
              <AlertCircle className="size-5" />
            ) : (
              <QrCode className="size-5" />
            )}
          </span>
          <DialogTitle className="text-lg">Pay with QR Ph</DialogTitle>
          <DialogDescription>
            Scan this one-time QR code in your bank or e-wallet app.
          </DialogDescription>
        </DialogHeader>

        {payment && (
          <div className="flex flex-col items-center gap-4 py-1">
            {qrExpiredLocally || expired ? (
              <div className="grid size-56 place-items-center rounded-2xl border bg-muted/30 p-5 text-center sm:size-64">
                <div className="space-y-2">
                  <Clock3 className="mx-auto size-7 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {paymentStatus === "Expired"
                      ? "This QR code has expired"
                      : paymentStatus === "Failed"
                        ? "This payment was not completed"
                        : "QR code expired"}
                  </p>
                  {isAwaitingPayment && (
                    <p className="text-xs text-muted-foreground">
                      Checking whether the payment completed before expiry…
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border bg-white p-3 shadow-sm">
                <img
                  src={imageSrc}
                  alt="QR Ph payment code"
                  className="size-56 max-w-full object-contain sm:size-64"
                />
              </div>
            )}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Amount to pay</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                ₱{payment.amount.toFixed(2)}
              </p>
            </div>

            {expired ? (
              <div className="w-full rounded-xl border border-destructive/20 p-3 text-center text-sm text-destructive">
                {paymentStatus === "Expired"
                  ? "This QR code expired before payment was confirmed."
                  : "PayMongo could not complete this payment."}
              </div>
            ) : paymentStatus === "Paid" ? (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" /> Payment confirmed. Opening
                your order…
              </div>
            ) : (
              <div className="w-full space-y-2 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-medium">
                  {statusQuery.isError ? (
                    <AlertCircle className="size-4 text-destructive" />
                  ) : (
                    <LoaderCircle className="size-4 animate-spin text-primary" />
                  )}
                  {paymentStatus === "GeneratingQR"
                    ? "Generating a replacement QR code…"
                    : statusQuery.isError
                      ? "Connection interrupted. We’ll keep checking your payment."
                      : "Waiting for payment confirmation…"}
                </p>
                {!qrExpiredLocally ? (
                  <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" /> QR expires in {minutes}:
                    {seconds}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    QR expired. We’re checking for a final payment update.
                  </p>
                )}
                {statusQuery.isError && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void statusQuery.refetch()}
                    disabled={statusQuery.isFetching}
                  >
                    Check again
                  </Button>
                )}
                {qrExpiredLocally && paymentStatus === "Pending" && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-muted-foreground">
                      The QR is no longer valid. Request a new one to continue;
                      we’ll check payment status before generating it.
                    </p>
                    <Button
                      size="sm"
                      onClick={onGenerateNewQR}
                      disabled={isGeneratingQR || statusQuery.isFetching}
                    >
                      {isGeneratingQR ? "Generating QR…" : "Generate new QR"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {expired && (
              <div className="w-full space-y-2">
                <Button
                  className="w-full"
                  onClick={onGenerateNewQR}
                  disabled={isGeneratingQR || statusQuery.isFetching}
                >
                  {isGeneratingQR ? "Generating QR…" : "Generate new QR"}
                </Button>
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Return to checkout
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
