import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { io } from "socket.io-client"
import { useParams, Link } from "react-router-dom"
import {
  Bike,
  Check,
  Clock3,
  MapPin,
  PackageCheck,
  Store,
  TriangleAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "@/lib/axios"
import { useAuthStore } from "@/store/authStore"
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet"
import type { LatLngExpression } from "leaflet"

type Driver = {
  _id: string
  avatar?: string
  vehicleType: string
  plateNumber?: string
  currentLocation?: { coordinates?: [number, number] }
  user?: { firstName: string; lastName: string; phoneNumber?: string }
}
type CustomerOrder = {
  _id: string
  orderNumber: string
  status: string
  driverMatchingStatus?: "Searching" | "Assigned" | "NoDriverFound"
  driverHeadingToMerchantAt?: string | null
  driverArrivedAtMerchantAt?: string | null
  driver: string | Driver | null
  createdAt: string
  deliveryAddress: {
    street: string
    barangay: string
    city: string
    province: string
    recipientName?: string
    phoneNumber?: string
    location: { coordinates: [number, number] }
  }
  merchant: string | { merchantName: string }
  items: Array<{ productName: string; quantity: number }>
  pricing: { total: number }
}

function FollowDriver({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.8 })
  }, [map, position])
  return null
}

function SearchingMap() {
  return (
    <div className="relative h-64 overflow-hidden rounded-xl border bg-muted/30 sm:h-80">
      <svg
        viewBox="0 0 720 320"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <path
          d="M-30 70 130 125 230 45 360 112 505 32 760 120M-30 240 100 190 225 280 380 190 540 280 760 200M110 -20 180 80 150 200 230 340M440 -20 395 90 490 175 430 340M620 -20 575 100 640 205 590 340"
          fill="none"
          stroke="currentColor"
          strokeWidth="17"
          className="text-background"
        />
        <path
          d="M-30 70 130 125 230 45 360 112 505 32 760 120M-30 240 100 190 225 280 380 190 540 280 760 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 8"
          className="text-border"
        />
        <path
          d="M200 160h125m55 0h155"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="7 10"
          className="text-primary/50"
        />
      </svg>
      <div className="absolute top-[48%] left-[48%] grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary/10">
        <span className="absolute size-16 animate-ping rounded-full bg-primary/20" />
        <span className="relative grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
          <Bike className="size-5" />
        </span>
      </div>
      <div className="absolute bottom-3 left-3 rounded-lg border bg-background/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
        Searching nearby drivers…
      </div>
    </div>
  )
}

function LiveMap({
  destination,
  driver,
}: {
  destination: [number, number]
  driver: [number, number]
}) {
  const end: LatLngExpression = [destination[1], destination[0]]
  const current: [number, number] = [driver[1], driver[0]]
  return (
    <div className="h-72 overflow-hidden rounded-xl border sm:h-96">
      <MapContainer
        center={current}
        zoom={14}
        scrollWheelZoom={false}
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FollowDriver position={current} />
        <Marker position={current} />
        <Marker position={end} />
        <Polyline
          positions={[current, end]}
          pathOptions={{ color: "#f97316", dashArray: "8 8", weight: 4 }}
        />
      </MapContainer>
    </div>
  )
}

function OrderTrackingPage() {
  const { orderId } = useParams()
  const queryClient = useQueryClient()
  const activeRole = useAuthStore((state) => state.activeRole)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [liveLocation, setLiveLocation] = useState<[number, number] | null>(
    null
  )
  const orderQuery = useQuery({
    queryKey: ["customerOrder", orderId],
    queryFn: async () => {
      const { data } = await axios.get<{ data: CustomerOrder }>(
        `/orders/${orderId}`
      )
      return data.data
    },
    enabled: Boolean(orderId),
    refetchInterval: (query) =>
      ["Delivered", "Rejected", "Cancelled", "NoDriverFound"].includes(
        query.state.data?.status ?? ""
      ) || query.state.data?.driverMatchingStatus === "NoDriverFound"
        ? false
        : 5000,
  })
  const order = orderQuery.data
  const isPickedUp = order?.status === "PickedUp"
  const driver =
    order?.driver && typeof order.driver === "object" ? order.driver : null

  useEffect(() => {
    if (!isAuthenticated || activeRole !== "Customer" || !orderId) return
    const socket = io(
      import.meta.env.DEV ? "http://localhost:5050" : undefined,
      { withCredentials: true, auth: { activeRole } }
    )
    const refresh = () => {
      void queryClient.invalidateQueries({
        queryKey: ["customerOrder", orderId],
      })
    }
    socket.on("order:assigned", refresh)
    socket.on("driver:heading-to-merchant", refresh)
    socket.on("order:noDriverFound", refresh)
    socket.on("order:merchantAccepted", refresh)
    socket.on("order:ready", refresh)
    socket.on("order:pickedUp", refresh)
    socket.on("order:delivered", refresh)
    socket.on("order:cancel", refresh)
    socket.on("order:rejected", refresh)
    socket.on("driver:arrived-at-merchant", refresh)
    socket.on(
      "driver:current-location",
      (payload: { orderId?: string; coordinates?: [number, number] }) => {
        if (payload.orderId === orderId && payload.coordinates)
          setLiveLocation(payload.coordinates)
      }
    )
    return () => {
      socket.disconnect()
    }
  }, [activeRole, isAuthenticated, orderId, queryClient])

  useEffect(() => {
    const coordinates = driver?.currentLocation?.coordinates
    if (
      isPickedUp &&
      coordinates &&
      coordinates.length === 2 &&
      (coordinates[0] !== 0 || coordinates[1] !== 0)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveLocation(coordinates)
    }
  }, [isPickedUp, driver?.currentLocation?.coordinates])

  if (orderQuery.isLoading)
    return (
      <main className="mx-auto w-full max-w-4xl animate-pulse p-5 sm:p-8">
        <div className="h-8 w-60 rounded bg-muted" />
        <div className="mt-6 h-80 rounded-xl bg-muted" />
      </main>
    )
  if (!order)
    return (
      <main className="mx-auto max-w-xl p-6 text-center">
        <TriangleAlert className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-3 text-xl font-semibold">
          We couldn’t load this order
        </h1>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => void orderQuery.refetch()}
        >
          Try again
        </Button>
      </main>
    )

  const merchantName =
    typeof order.merchant === "string"
      ? "the store"
      : order.merchant.merchantName
  const destination = order.deliveryAddress.location.coordinates
  const stage =
    order.status === "Delivered"
      ? "Delivered"
      : isPickedUp
        ? "On the way"
        : driver
          ? order.driverArrivedAtMerchantAt
            ? "Driver is at the store"
            : order.driverHeadingToMerchantAt
              ? "Driver heading to the store"
              : "Driver assigned"
          : order.driverMatchingStatus === "Searching"
            ? "Finding a driver"
            : order.status === "Preparing"
              ? "Store is preparing your order"
              : order.status === "ReadyForPickup"
                ? "Order ready for pickup"
                : "Finding a driver"
  const noDriverFound =
    order.driverMatchingStatus === "NoDriverFound" ||
    order.status === "NoDriverFound"
  const isFailed =
    noDriverFound || ["Rejected", "Cancelled"].includes(order.status)

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 p-4 sm:space-y-6 sm:p-8">
      <header>
        <p className="text-sm font-medium text-primary">
          Order #{order.orderNumber}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {isFailed ? "Order update" : stage}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isFailed
            ? noDriverFound
              ? "No driver was available for this order."
              : `This order is ${order.status.toLowerCase()}.`
            : `Updates for your order from ${merchantName}.`}
        </p>
      </header>
      {isFailed ? (
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <TriangleAlert className="size-9 text-destructive" />
            <p className="mt-3 font-medium">
              {noDriverFound
                ? "We couldn’t find an available driver."
                : `Your order was ${order.status.toLowerCase()}.`}
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex h-9 items-center rounded-md border px-4 text-sm"
            >
              Back to stores
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {isPickedUp && liveLocation ? (
            <LiveMap destination={destination} driver={liveLocation} />
          ) : !driver ? (
            <SearchingMap />
          ) : (
            <Card>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <img
                  src={driver.avatar || "/driver-avatar.jpg"}
                  alt=""
                  className="size-16 rounded-full border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Your driver</p>
                  <p className="font-semibold">
                    {driver.user
                      ? `${driver.user.firstName} ${driver.user.lastName}`
                      : "Driver assigned"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {driver.vehicleType}
                    {driver.plateNumber ? ` · ${driver.plateNumber}` : ""}
                  </p>
                </div>
                {driver.user?.phoneNumber && (
                  <a
                    className="inline-flex h-9 items-center rounded-md border px-4 text-sm"
                    href={`tel:${driver.user.phoneNumber}`}
                  >
                    Call driver
                  </a>
                )}
                <p className="w-full border-t pt-3 text-sm text-muted-foreground sm:w-auto sm:border-0 sm:pt-0">
                  Live tracking starts after pickup.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="size-5 text-primary" /> Order progress
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-4">
              {[
                { label: "Order placed", done: true, icon: Check },
                { label: "Driver assigned", done: Boolean(driver), icon: Bike },
                {
                  label: "Picked up",
                  done: isPickedUp || order.status === "Delivered",
                  icon: Store,
                },
                {
                  label: "Delivered",
                  done: order.status === "Delivered",
                  icon: MapPin,
                },
              ].map(({ label, done, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 sm:flex-col sm:items-start"
                >
                  <span
                    className={`grid size-9 place-items-center rounded-full ${done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span
                    className={`text-sm ${done ? "font-medium" : "text-muted-foreground"}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-medium">Delivery address</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.deliveryAddress.recipientName}
              {order.deliveryAddress.phoneNumber
                ? ` · ${order.deliveryAddress.phoneNumber}`
                : ""}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.deliveryAddress.street}, {order.deliveryAddress.barangay},{" "}
              {order.deliveryAddress.city}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              Total ₱{order.pricing.total.toFixed(2)} · {order.items.length}{" "}
              {order.items.length === 1 ? "item" : "items"}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex h-9 items-center rounded-md border px-4 text-sm"
          >
            Continue browsing
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

export default OrderTrackingPage
