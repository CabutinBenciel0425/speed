import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, MapPin, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAddress } from "@/hooks/useAddress"
import { Skeleton } from "../ui/skeleton"
import type { Address } from "@/types/address"
import { useToggleDefaultAddress } from "@/hooks/useToggleDefaultAddress"

export function Addressbar() {
  const { addresses, defaultAddress, isLoading } = useAddress()
  const { mutate: toggleDefault, isPending: isToggling } =
    useToggleDefaultAddress()

  const [currentAddress, setCurrentAddress] = useState<Address | null>(
    defaultAddress ?? addresses[0] ?? null
  )

  useEffect(() => {
    if (defaultAddress && defaultAddress.label !== currentAddress?.label) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentAddress(defaultAddress)
    }
  }, [defaultAddress, currentAddress?.label])

  const formatAddress = (address: Address | null): string => {
    if (!address) return "Select Address"
    return (
      address.label || address.street || `${address.barangay}, ${address.city}`
    )
  }

  if (isLoading) {
    return <Skeleton className="h-14 w-40" />
  }

  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="h-14 gap-2 bg-gray-100 px-3 hover:bg-gray-200"
            >
              <MapPin className="size-5 text-primary" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">
                  Deliver to
                </span>
                <span className="line-clamp-1 text-sm leading-tight font-semibold">
                  {formatAddress(currentAddress)}
                </span>
              </div>
              <ChevronDown className="size-4 text-gray-400" />
            </Button>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DropdownMenuContent className="w-80" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-semibold">
                Your Addresses
              </DropdownMenuLabel>

              <DropdownMenuRadioGroup
                value={currentAddress?.label || ""}
                onValueChange={(value) => {
                  const selected = addresses.find(
                    (addr) => addr.label === value
                  )
                  if (selected) setCurrentAddress(selected)
                }}
              >
                {addresses.map((address) => {
                  const isDefault = address.isDefault === true

                  return (
                    <DropdownMenuRadioItem
                      key={address.label}
                      value={address.label}
                      className="flex items-center justify-between py-2.5 pr-2"
                    >
                      <div className="flex flex-1 flex-col items-start gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">
                            {address.label}
                          </span>
                          {isDefault && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="line-clamp-1 text-xs text-gray-500">
                          {address.street} {address.barangay}, {address.city}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isDefault) {
                            toggleDefault(address.label)
                          }
                        }}
                        disabled={isToggling || isDefault}
                      >
                        <Star
                          className={`size-4 transition-colors ${
                            isDefault
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400 hover:text-yellow-400"
                          }`}
                        />
                      </Button>
                    </DropdownMenuRadioItem>
                  )
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </motion.div>
      </DropdownMenu>
    </div>
  )
}
