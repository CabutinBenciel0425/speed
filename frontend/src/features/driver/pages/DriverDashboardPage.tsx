import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"
import {
  Bike,
  Check,
  Clock3,
  MapPin,
  PackageCheck,
  Power,
  Store,
  Truck,
  UserRound,
} from "lucide-react"
import { Navigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/useAuth"
import { useAuthStore } from "@/store/authStore"
import axios from "@/lib/axios"
import type { DeliveryOffer } from "@/features/merchant/store/offerStore"

type DriverProfile = {
  _id: string
  status: string
  isAvailable: boolean
  workingStatus: string
  activeOrder?: string | null
}

type DriverOrder = {
  _id: string
  orderNumber: string
  status: string
  merchant:
    | {
        merchantName: string
        address?: { street?: string; barangay?: string; city?: string }
      }
    | string
  customer?: { firstName?: string; lastName?: string }
  deliveryAddress?: { street: string; barangay: string; city: string }
  driverArrivedAtMerchantAt?: string
}

function DriverDashboardPage() {
  const { activeRole, isAuthenticated, isLoading } = useAuth()
  const queryClient = useQueryClient()
  const activeRoleState = useAuthStore((state) => state.activeRole)
  const [offers, setOffers] = useState<DeliveryOffer[]>([])
  const [socketConnected, setSocketConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const locationSentAt = useRef(0)
  const profileQuery = useQuery({
    queryKey: ["driverProfile"],
    queryFn: async () =>
      (await axios.get<{ data: DriverProfile }>("/driver")).data.data,
    enabled: isAuthenticated && activeRole === "Driver",
    refetchInterval: 15000,
  })
  const orderQuery = useQuery({
    queryKey: ["driverCurrentOrder"],
    queryFn: async () => {
      const { data } = await axios.get<{ data?: DriverOrder }>(
        "/driver/orders/current"
      )
      return data.data ?? null
    },
    enabled: isAuthenticated && activeRole === "Driver",
    refetchInterval: 10000,
  })
  const availabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) =>
      (
        await axios.patch<{ data: DriverProfile }>("/driver/availability", {
          isAvailable,
        })
      ).data.data,
    onSuccess: (profile) => {
      queryClient.setQueryData(["driverProfile"], profile)
      toast.success(
        profile.isAvailable
          ? "You’re online and can receive offers."
          : "You’re offline."
      )
    },
    onError: () => toast.error("Could not update availability."),
  })
  const orderAction = useMutation({
    mutationFn: async ({
      orderId,
      action,
    }: {
      orderId: string
      action: "heading-to-merchant" | "picked-up" | "delivered"
    }) => {
      const path = `/driver/orders/${orderId}/${action}`

      return axios.patch(path)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["driverCurrentOrder"] })
      void queryClient.invalidateQueries({ queryKey: ["driverProfile"] })
    },
    onError: () => toast.error("That delivery update could not be saved."),
  })

  useEffect(() => {
    if (!isAuthenticated || activeRoleState !== "Driver") return
    const socket = io(
      import.meta.env.DEV ? "http://localhost:5050" : undefined,
      { withCredentials: true, auth: { activeRole: activeRoleState } }
    )
    socketRef.current = socket
    socket.on("connect", () => setSocketConnected(true))
    socket.on("disconnect", () => setSocketConnected(false))
    socket.on("delivery:offer", (offer: DeliveryOffer) =>
      setOffers((current) =>
        current.some((item) => item.offerId === offer.offerId)
          ? current
          : [offer, ...current]
      )
    )
    socket.on("delivery:expired", ({ offerId }: { offerId: string }) =>
      setOffers((current) =>
        current.filter((offer) => offer.offerId !== offerId)
      )
    )
    socket.on("delivery:accepted", ({ offerId }: { offerId: string }) => {
      setOffers((current) =>
        current.filter((offer) => offer.offerId !== offerId)
      )
      void queryClient.invalidateQueries({ queryKey: ["driverCurrentOrder"] })
      void queryClient.invalidateQueries({ queryKey: ["driverProfile"] })
    })
    const refreshOrder = () => {
      void queryClient.invalidateQueries({ queryKey: ["driverCurrentOrder"] })
      void queryClient.invalidateQueries({ queryKey: ["driverProfile"] })
    }
    socket.on("order:merchantAccepted", refreshOrder)
    socket.on("driver:arrived-at-merchant", refreshOrder)
    socket.on("order:ready", () => {
      console.log("ORDER IS READY FOR PICK UP")
      toast.info("Order is ready for pick up")
      refreshOrder()
    })
    socket.on("order:cancel", () => {
      console.log("ORDER IS CANCELLED")
      toast.warning("Order has been cancelled")
      refreshOrder()
    })

    socket.on("order:rejected", () => {
      console.log("ORDER IS REJECTED")
      toast.warning("Order has been rejected")
      refreshOrder()
    })
    socket.on("socket:error", ({ message }: { message?: string }) =>
      toast.error(message ?? "A driver action failed.")
    )
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [activeRoleState, isAuthenticated, queryClient])

  const currentOrder = orderQuery.data
  useEffect(() => {
    const isOnDelivery = [
      "Assigned",
      "HeadingToMerchant",
      "ArrivedAtMerchant",
      "Delivering",
    ].includes(profileQuery.data?.workingStatus ?? "")
    if (!profileQuery.data?.isAvailable && !isOnDelivery) return
    if (!navigator.geolocation) return
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now()
        if (now - locationSentAt.current < 8000) return
        locationSentAt.current = now
        void axios.patch("/driver/location", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          orderId: currentOrder?._id,
        })
      },
      () =>
        toast.error("Allow location access to update your delivery position."),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
    return () => navigator.geolocation.clearWatch(watcher)
  }, [
    currentOrder?._id,
    profileQuery.data?.isAvailable,
    profileQuery.data?.workingStatus,
  ])

  if (isLoading) return null
  if (!isAuthenticated || activeRole !== "Driver")
    return <Navigate to="/login" replace />

  const profile = profileQuery.data
  const merchantName =
    currentOrder && typeof currentOrder.merchant !== "string"
      ? currentOrder.merchant.merchantName
      : "Store"
  const offerAction = (offerId: string, accepted: boolean) => {
    socketRef.current?.emit(accepted ? "delivery:accept" : "delivery:decline", {
      offerId,
    })
    if (!accepted)
      setOffers((current) =>
        current.filter((offer) => offer.offerId !== offerId)
      )
  }
  const changeAvailability = (available: boolean) => {
    if (!available) {
      availabilityMutation.mutate(false)
      return
    }
    if (!navigator.geolocation) {
      toast.error("Location is needed to receive nearby delivery offers.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void axios
          .patch("/driver/location", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          .then(() => availabilityMutation.mutate(true))
          .catch(() => toast.error("Could not verify your location."))
      },
      () => toast.error("Allow location access before going online."),
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 p-4 sm:space-y-6 sm:p-8">
      <header>
        <p className="text-sm font-medium text-primary">Speed Driver</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your deliveries
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your availability and follow each delivery step.
        </p>
      </header>
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-11 place-items-center rounded-full ${profile?.isAvailable ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}
            >
              <Power className="size-5" />
            </span>
            <div>
              <p className="font-medium">
                {profile?.isAvailable ? "You’re online" : "You’re offline"}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile?.status === "Operational"
                  ? "Go online to receive nearby delivery offers."
                  : `Account status: ${profile?.status ?? "Loading"}`}
              </p>
            </div>
          </div>
          <Switch
            checked={profile?.isAvailable ?? false}
            disabled={
              !profile ||
              profile.status !== "Operational" ||
              availabilityMutation.isPending ||
              !socketConnected ||
              Boolean(profile.activeOrder)
            }
            onCheckedChange={changeAvailability}
            aria-label="Toggle driver availability"
          />
        </CardContent>
      </Card>

      {profile?.status !== "Operational" && (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Your driver profile needs to be approved before you can go online.
          </CardContent>
        </Card>
      )}

      {offers.map((offer) => (
        <Card key={offer.offerId} className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-5 text-primary" /> Delivery offer
            </CardTitle>
            <CardDescription>
              Review the trip and accept while it’s available.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Pickup at {offer.merchantName}</p>
              <p className="text-sm text-muted-foreground">
                {offer.merchantAddress?.street},{" "}
                {offer.merchantAddress?.barangay}, {offer.merchantAddress?.city}
              </p>
              <p className="mt-3 text-sm font-medium">Deliver to</p>
              <p className="text-sm text-muted-foreground">
                {offer.customerAddress?.street},{" "}
                {offer.customerAddress?.barangay}, {offer.customerAddress?.city}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg border p-3 text-center">
              <div>
                <p className="font-semibold">₱{offer.deliveryFee}</p>
                <p className="text-xs text-muted-foreground">Earnings</p>
              </div>
              <div>
                <p className="font-semibold">
                  {offer.estimatedDistance.toFixed(1)} km
                </p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>
              <div>
                <p className="font-semibold">{offer.estimatedDuration} min</p>
                <p className="text-xs text-muted-foreground">Est. trip</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => offerAction(offer.offerId, true)}
              >
                Accept offer
              </Button>
              <Button
                variant="outline"
                onClick={() => offerAction(offer.offerId, false)}
              >
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {currentOrder ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageCheck className="size-5 text-primary" /> Order #
              {currentOrder.orderNumber}
            </CardTitle>
            <CardDescription>
              {currentOrder.status} · {merchantName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                {currentOrder.deliveryAddress?.street},{" "}
                {currentOrder.deliveryAddress?.barangay},{" "}
                {currentOrder.deliveryAddress?.city}
              </span>
            </div>
            {currentOrder.customer && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserRound className="size-4" />
                {currentOrder.customer.firstName}{" "}
                {currentOrder.customer.lastName}
              </p>
            )}
            {currentOrder.status === "Pending" && (
              <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                The store is reviewing this order. You’ll be able to head to
                store location after it’s accepted.
              </p>
            )}
            {["Preparing", "ReadyForPickup"].includes(currentOrder.status) &&
              profile?.workingStatus === "Assigned" && (
                <Button
                  className="w-full sm:w-auto"
                  onClick={() =>
                    orderAction.mutate({
                      orderId: currentOrder._id,
                      action: "heading-to-merchant",
                    })
                  }
                  disabled={orderAction.isPending}
                >
                  <MapPin className="size-4" /> Head to store
                </Button>
              )}
            {/* {profile?.workingStatus === "HeadingToMerchant" && (
              <Button
                className="w-full sm:w-auto"
                variant={"outline"}
                disabled={!!profile?.workingStatus}
              >
                <MapPin className="size-4" /> Heading to Merchant
              </Button>
            )} */}

            {profile?.workingStatus === "ArrivedAtMerchant" &&
              currentOrder.driverArrivedAtMerchantAt &&
              currentOrder.status === "Preparing" && (
                <Button
                  className="w-full sm:w-auto"
                  variant={"outline"}
                  disabled={
                    !!(
                      profile?.workingStatus === "ArrivedAtMerchant" &&
                      currentOrder.driverArrivedAtMerchantAt &&
                      currentOrder.status === "Preparing"
                    )
                  }
                >
                  <MapPin className="size-4" /> Arrived at Merchant
                </Button>
              )}

            {currentOrder.status === "ReadyForPickup" &&
              profile?.workingStatus === "ArrivedAtMerchant" && (
                <Button
                  className="w-full sm:w-auto"
                  onClick={() =>
                    orderAction.mutate({
                      orderId: currentOrder._id,
                      action: "picked-up",
                    })
                  }
                  disabled={orderAction.isPending}
                >
                  <Store className="size-4" /> Confirm pickup
                </Button>
              )}
            {currentOrder.status === "PickedUp" && (
              <Button
                className="w-full sm:w-auto"
                onClick={() =>
                  orderAction.mutate({
                    orderId: currentOrder._id,
                    action: "delivered",
                  })
                }
                disabled={orderAction.isPending}
              >
                <Check className="size-4" /> Confirm delivery
              </Button>
            )}
            {profile?.workingStatus === "HeadingToMerchant" && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="size-4" />
                Location is updating while you travel to pickup.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}
      {!offers.length && !currentOrder && profile?.status === "Operational" && (
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            <Bike className="size-9 text-muted-foreground" />
            <p className="mt-3 font-medium">
              {profile.isAvailable
                ? "Waiting for a nearby offer"
                : "Go online when you’re ready"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Delivery requests will appear here. You can review the pickup and
              estimated trip before accepting.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

export default DriverDashboardPage
