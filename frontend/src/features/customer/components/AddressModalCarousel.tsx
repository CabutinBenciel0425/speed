import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import AddressLabelStep from "./AddressLabelStep"
import type { Address } from "@/types/address"
import RecipientStep from "./RecipientStep"
import AddressDetailsStep from "./AddressDetailsStep"
import LocationStep from "./LocationStep"
import { useFormContext } from "react-hook-form"
import type { AddressFormValues } from "../types/address"
import { useEffect, useState } from "react"
import { ADDRESS_STEP_FIELDS } from "../utils/addressForm"
import { Button } from "@/components/ui/button"

function AddressModalCarousel({
  addresses,
  addressValues,
  isEditing,
  open,
}: {
  addresses: Address[]
  addressValues?: Address
  isEditing: boolean
  open: boolean
}) {
  const { trigger } = useFormContext<AddressFormValues>()

  const [api, setApi] = useState<CarouselApi>()

  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!api) return

    const handleSelect = () => {
      setCurrentStep(api.selectedScrollSnap())
    }

    handleSelect()

    api.on("select", handleSelect)

    return () => {
      api.off("select", handleSelect)
    }
  }, [api])

  const handleNext = async () => {
    const fields = ADDRESS_STEP_FIELDS[currentStep]

    const valid = await trigger(fields)

    if (!valid) return

    api?.scrollNext()
  }

  const handleBack = () => {
    api?.scrollPrev()
  }

  useEffect(() => {
    if (!open || !api) return

    api.reInit()
    api.scrollTo(0)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentStep(0)
  }, [open, api])
  return (
    <Carousel
      className="w-full min-w-0"
      setApi={setApi}
      opts={{
        watchDrag: false,
      }}
    >
      <CarouselContent className="w-full">
        <CarouselItem className="min-w-0 basis-full">
          <div className="w-full min-w-0 py-5">
            <AddressLabelStep
              addresses={addresses}
              addressValues={addressValues}
            />
          </div>
        </CarouselItem>

        <CarouselItem className="min-w-0 basis-full">
          <div className="w-full min-w-0 py-5">
            <RecipientStep />
          </div>
        </CarouselItem>

        <CarouselItem className="min-w-0 basis-full">
          <div className="w-full min-w-0 py-5">
            <AddressDetailsStep />
          </div>
        </CarouselItem>

        <CarouselItem className="min-w-0 basis-full">
          <div className="w-full min-w-0 py-5">
            <LocationStep />
          </div>
        </CarouselItem>
      </CarouselContent>

      <div className="flex justify-between">
        {currentStep > 0 && (
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}

        {currentStep < 3 ? (
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button type="submit">
            {isEditing ? "Save Changes" : "Add Address"}
          </Button>
        )}
      </div>
    </Carousel>
  )
}

export default AddressModalCarousel
