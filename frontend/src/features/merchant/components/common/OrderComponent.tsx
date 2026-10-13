import { Card } from "@/components/ui/card"
import { useParams } from "react-router-dom"
import { useOrder } from "../../hooks/useOrder"
import { Clock, NotepadText, Phone } from "lucide-react"
import { formatTimeAndDate } from "@/utils/timeUtils"
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter"

function OrderComponent() {
  const { orderId } = useParams()

  const { data } = useOrder(orderId || "")
  const orderDate =
    data?.driverMatchingStatus === "Searching" ||
    data?.driverMatchingStatus === "NoDriverFound"
      ? data?.createdAt
      : data?.acceptedAt

  console.log(data)
  return (
    <div className="w-full px-5 xl:px-10">
      <div className="flex flex-col gap-4">
        <Card className="flex max-w-5xl flex-row items-center justify-between p-4">
          <div className="flex h-full flex-1 flex-col justify-around gap-2">
            {data?.status === "Pending" && (
              <span className="mb-5 w-fit rounded-lg bg-primary px-3 py-1.5 text-sm text-white">
                New Order
              </span>
            )}
            <div
              className={`flex flex-row gap-3 ${data?.status === "Pending" ? "mb-3" : "mb-6"}`}
            >
              <h1 className="text-lg font-semibold text-primary">
                #{data?.orderNumber}
              </h1>
              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-4" />{" "}
                <span>{orderDate && formatTimeAndDate(orderDate)}</span>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <img
                src={data?.customer.avatar}
                alt={data?.customer.firstName}
                className="size-15 rounded-full"
              />
              <div className="flex flex-col justify-center gap-2 text-sm">
                <p className="flex flex-row gap-2">
                  {capitalizeFirstLetter(
                    data?.customer ? data?.customer.firstName : ""
                  )}{" "}
                  {capitalizeFirstLetter(
                    data?.customer ? data?.customer.lastName : ""
                  )}
                  <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Customer
                  </span>
                </p>
                <p className="flex flex-row items-center gap-2 text-muted-foreground/80">
                  <Phone className="size-4" /> {data?.customer.phoneNumber}
                </p>
              </div>
            </div>
            {data?.customerNote && (
              <div className="mt-2 flex flex-row items-center gap-2 text-sm text-muted-foreground">
                <NotepadText className="size-6" />{" "}
                <span>{data?.customerNote}</span>
              </div>
            )}
          </div>

          <div className="min-w-md rounded-md border border-muted-foreground/30 p-3">
            <div className="border-b border-b-muted-foreground/30">
              <h2 className="text-sm font-semibold">Order Summary</h2>
              <p className="flex flex-row items-center justify-between">
                <span className="text-muted-foreground">
                  {(data?.items?.length ?? 0) > 1
                    ? `${data?.items?.length ?? 0} items`
                    : `${data?.items?.length ?? 0} item`}
                </span>
                <span className="text-lg font-bold">
                  ₱ {data?.pricing?.total}
                </span>
              </p>
            </div>

            <div className="border-b border-b-muted-foreground/30 py-2">
              <p className="flex flex-row items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ₱ {data?.pricing?.subtotal}
                </span>
              </p>
              <p className="flex flex-row items-center justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ₱ {data?.pricing?.deliveryFee}
                </span>
              </p>
            </div>

            <div className="pt-2">
              <p className="flex flex-row items-center justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-primary">
                  ₱ {data?.pricing?.total}
                </span>
              </p>
            </div>
          </div>
        </Card>
        <Card className="max-w-5xl px-5">
          <h2 className="text-lg font-bold">Order Items</h2>
          <div className="divide-y divide-muted-foreground/30 rounded-md border border-muted-foreground/30">
            {data?.items.map((item) => (
              <div
                key={item.product}
                className="flex flex-row items-center justify-between gap-2"
              >
                <div className="flex flex-row items-center justify-start">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="h-20 w-20 rounded-md"
                  />
                  <div className="flex flex-col gap-2 py-4">
                    <p className="text-sm font-semibold">{item.productName}</p>
                    <p className="text-muted-foreground">₱ {item.unitPrice}</p>
                    {item.notes && (
                      <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                        <NotepadText className="size-4" />
                        <span>{item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex w-1/2 flex-row items-center">
                  <div className="w-1/3">
                    <span className="text-sm text-muted-foreground">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="flex w-2/3 flex-row items-center justify-between px-5">
                    <span className="text-muted-foreground">
                      ₱{item.unitPrice}
                    </span>
                    <span className="text-lg font-bold">₱{item.subtotal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default OrderComponent
