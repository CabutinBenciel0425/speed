import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Clock10, X } from "lucide-react"
import {
  buildOrderTimeline,
  formatStepTime,
  getOrderStatusHeader,
  type OrderTimelineInput,
  type TimelineStep,
} from "../../features/merchant/utils/orderTimeline"

function StepDot({ state }: { state: TimelineStep["state"] }) {
  if (state === "failed") {
    return (
      <div className="flex size-6 items-center justify-center rounded-full bg-destructive">
        <X className="size-4 text-white" />
      </div>
    )
  }
  if (state === "done") {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-primary">
        <Check className="size-3 text-white" />
      </div>
    )
  }
  if (state === "current") {
    return (
      <div className="flex size-7 items-center justify-center rounded-full bg-primary/40">
        <div className="size-4 rounded-full border-2 border-white bg-primary" />
      </div>
    )
  }
  return (
    <div className="size-4 rounded-full border-2 border-muted-foreground/50" />
  )
}

function OrderStatusTimeline({ order }: { order: OrderTimelineInput }) {
  const steps = buildOrderTimeline(order)
  const header = getOrderStatusHeader(order)
  const isFailed = order.status === "Rejected" || order.status === "Cancelled"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle
          className={`flex flex-row items-center gap-3 rounded-lg p-2 ${isFailed ? "bg-destructive/15" : "bg-primary/20"}`}
        >
          <div
            className={`shrink-0 rounded-full p-2 ${isFailed ? "bg-destructive/70" : "bg-primary/70"}`}
          >
            <Clock10 className="size-6 text-white sm:size-8" />
          </div>
          <div>
            <p className="text-sm">Order Status</p>
            <p className="text-lg font-semibold">{header.title}</p>
            <p className="text-xs text-muted-foreground">{header.subtitle}</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ol className="flex flex-col">
          {steps.map((step, i) => {
            const next = steps[i + 1]
            const lineActive = next && next.state !== "upcoming"
            return (
              <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
                {next && (
                  <span
                    className={`absolute top-7 bottom-0 left-3.5 w-0.5 -translate-x-1/2 ${lineActive ? "bg-primary" : "bg-muted-foreground/30"}`}
                  />
                )}

                <div className="flex size-7 shrink-0 items-center justify-center">
                  <StepDot state={step.state} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-row flex-wrap items-center gap-2">
                    <span
                      className={`text-base font-semibold ${step.state === "upcoming" ? "text-muted-foreground" : ""} ${step.state === "failed" ? "text-destructive" : ""}`}
                    >
                      {step.label}
                    </span>
                    {step.at && (
                      <span className="mt-0.5 text-xs text-muted-foreground">
                        {formatStepTime(step.at)}
                      </span>
                    )}
                  </div>
                  <p className="wrap-break-words text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

export default OrderStatusTimeline
