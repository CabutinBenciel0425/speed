import { ArrowLeft, Clock3, CreditCard, MapPin, Package, Phone, Store } from "lucide-react"
import { Link, Navigate, useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import OrderStatusBadge from "@/components/common/OrderStatusBadge"
import PageError from "@/components/common/PageError"
import { useAuth } from "@/hooks/useAuth"
import { useDriverOrderDetails } from "../hooks/useDriverData"
import { formatDriverOrderAddress } from "../utils/formatDriverOrderAddress"

const money = (value = 0) => `₱${value.toFixed(2)}`

export default function DriverOrderPage() {
  const { orderId } = useParams()
  const { activeRole, isAuthenticated, isLoading } = useAuth()
  const query = useDriverOrderDetails(orderId)
  const order = query.data

  if (isLoading) return <main className="page-shell"><Skeleton className="h-72 w-full" /></main>
  if (!isAuthenticated || activeRole !== "Driver") return <Navigate to="/login" replace />
  if (query.isLoading) return <main className="page-shell page-stack max-w-4xl"><Skeleton className="h-28 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-48 w-full" /></main>
  if (query.isError || !order) return <main className="page-shell max-w-4xl"><PageError message="Could not load this order. It may no longer be assigned to you." onRetry={() => void query.refetch()} isRetrying={query.isFetching} /></main>

  const merchant = typeof order.merchant === "string" ? null : order.merchant
  const savedAddress = order.deliveryAddress?.address
  const instructions = typeof savedAddress === "object" ? savedAddress.instructions : undefined
  const landmark = typeof savedAddress === "object" ? savedAddress.landmark : undefined
  const address = [order.deliveryAddress?.houseOrUnitNumber, order.deliveryAddress?.street, order.deliveryAddress?.barangay, order.deliveryAddress?.city, order.deliveryAddress?.province, order.deliveryAddress?.region].filter(Boolean).join(", ")
  const isCashOnDelivery = order.payment?.method === "Cash"

  return (
    <main className="page-shell page-stack max-w-4xl">
      <Link
        to={order.status === "Delivered" || ["Cancelled", "Rejected"].includes(order.status) ? "/driver/history" : "/driver"}
        className="-ml-3 inline-flex h-9 w-fit items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="size-4" /> Back to deliveries
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Delivery details</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{merchant?.merchantName ?? "Store"} · {formatDriverOrderAddress(order)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Delivery summary">
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"><MapPin className="size-5" /></span><div><p className="text-xl font-semibold">{order.deliveryDistanceKm == null ? "—" : `${order.deliveryDistanceKm.toFixed(1)} km`}</p><p className="text-xs text-muted-foreground">Merchant to destination</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"><Clock3 className="size-5" /></span><div><p className="text-xl font-semibold">{order.estimatedDeliveryTime ? `~${order.estimatedDeliveryTime} min` : "Not available"}</p><p className="text-xs text-muted-foreground">Estimated delivery time</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"><Package className="size-5" /></span><div><p className="text-xl font-semibold">{order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0} items</p><p className="text-xs text-muted-foreground">Across {order.items?.length ?? 0} products</p></div></CardContent></Card>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Items in this order</CardTitle><CardDescription>Check the order contents at pickup.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {order.items?.map((item, index) => <div key={`${item.productName}-${index}`} className="flex gap-3">
                {item.image ? <img src={item.image} alt="" className="size-16 shrink-0 rounded-lg border object-cover" /> : <span className="grid size-16 shrink-0 place-items-center rounded-lg border text-muted-foreground"><Package className="size-5" /></span>}
                <div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><p className="font-medium">{item.quantity} × {item.productName}</p><p className="shrink-0 font-medium">{money(item.subtotal ?? (item.unitPrice ?? 0) * item.quantity)}</p></div>{item.notes && <p className="mt-1 text-sm text-muted-foreground">Item note: {item.notes}</p>}</div>
              </div>)}
              {!order.items?.length && <p className="text-sm text-muted-foreground">No item details are available.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> Delivery address</CardTitle><CardDescription>Deliver the order to the recipient below.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{order.deliveryAddress?.recipientName}</p>
              <p className="text-sm text-muted-foreground">{address || "Address unavailable"}</p>
              {landmark && <p className="text-sm"><span className="font-medium">Landmark:</span> {landmark}</p>}
              <p className="flex items-center gap-2 text-sm"><Phone className="size-4 text-muted-foreground" />{order.deliveryAddress?.phoneNumber || "Phone unavailable"}</p>
              <Separator />
              <div><p className="text-sm font-medium">Delivery instructions</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{instructions || "No special instructions provided."}</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="size-4 text-primary" /> Payment summary</CardTitle><CardDescription>{isCashOnDelivery ? "Cash on delivery · settlement breakdown" : `${order.payment?.method ?? "Online payment"} · ${order.payment?.status ?? "Status unavailable"}`}</CardDescription></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {isCashOnDelivery && <div className="flex justify-between gap-3 rounded-lg border p-3"><span><span className="block font-medium">Pay the store at pickup</span><span className="text-xs text-muted-foreground">Items subtotal</span></span><span className="font-semibold">{money(order.pricing?.subtotal)}</span></div>}
              {!isCashOnDelivery && <div className="flex justify-between gap-3"><span className="text-muted-foreground">Items subtotal</span><span>{money(order.pricing?.subtotal)}</span></div>}
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Delivery fee · driver earnings</span><span>{money(order.pricing?.deliveryFee)}</span></div>
              {(order.pricing?.serviceFee ?? 0) > 0 && <div className="flex justify-between gap-3"><span className="text-muted-foreground">Service fee</span><span>{money(order.pricing?.serviceFee)}</span></div>}
              {(order.pricing?.discount ?? 0) > 0 && <div className="flex justify-between gap-3"><span className="text-muted-foreground">Discount</span><span>−{money(order.pricing?.discount)}</span></div>}
              <Separator />
              <div className="flex justify-between gap-3 text-base font-semibold"><span>{isCashOnDelivery ? "Collect from customer at delivery" : "Total paid online"}</span><span>{money(order.pricing?.total)}</span></div>
              <p className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                {isCashOnDelivery
                  ? "At pickup, settle the items amount with the store. After successful delivery, collect the full customer total, which includes the delivery fee. The fee is shown separately and is not added again to the store amount."
                  : "The delivery fee is shown separately for your earnings. It is already included once in the customer’s online total."}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Store className="size-4 text-primary" /> Pickup store</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm"><p className="font-medium">{merchant?.merchantName ?? "Store"}</p>{merchant?.address && <p className="text-muted-foreground">{[merchant.address.street, merchant.address.barangay, merchant.address.city, merchant.address.province].filter(Boolean).join(", ")}</p>}{merchant?.phoneNumber && <p className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" />{merchant.phoneNumber}</p>}</CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
