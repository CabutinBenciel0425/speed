import { Separator } from "@/components/ui/separator"
import { Clock, ShieldCheck, Star } from "lucide-react"

function AddressInfo() {
  return (
    <div className="flex w-full items-center justify-center lg:sticky lg:top-5 lg:w-80 lg:shrink-0 xl:w-95 2xl:w-105">
      <div className="flex h-80 max-w-90 flex-col items-start justify-start gap-5 rounded-md border border-muted-foreground/10 bg-background/20 p-5 shadow-xs lg:h-102 xl:h-92">
        <h1 className="text-base font-bold lg:text-lg">Quick Tips</h1>
        <div className="flex w-full flex-row items-center justify-start gap-5">
          <div className="">
            <ShieldCheck
              className="size-10 rounded-full bg-primary p-2"
              stroke="#fff"
            />
          </div>
          <div>
            <p className="text-sm font-semibold lg:text-base">
              Use a valid address
            </p>
            <p className="text-xs text-muted-foreground lg:text-sm">
              Make sure your address is complete and accurate to avoid delivery
              issues.
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex flex-row items-center justify-center gap-5">
          <div>
            <Clock
              className="size-10 rounded-full bg-primary p-2"
              stroke="#fff"
            />
          </div>
          <div>
            <p className="text-sm font-semibold lg:text-base">
              Keep it updated
            </p>
            <p className="text-xs text-muted-foreground lg:text-sm">
              Let us know if there are any changes to your address or contact
              details.
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex flex-row items-center justify-center gap-5">
          <div>
            <Star
              className="size-10 rounded-full bg-primary p-2"
              stroke="#fff"
            />
          </div>
          <div>
            <p className="text-sm font-semibold lg:text-base">
              Set your default address
            </p>
            <p className="text-xs text-muted-foreground lg:text-sm">
              Your default address will be used for a faster checkout
              experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressInfo
