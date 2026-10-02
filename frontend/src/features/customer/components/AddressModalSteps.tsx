import { useState, type ReactNode } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { Address } from "@/types/address"
import type { AddressInput } from "../types/address"
import { ADDRESS_STEP_FIELDS } from "../utils/addressForm"
import AddressLabelStep from "./AddressLabelStep"
import RecipientStep from "./RecipientStep"
import AddressDetailsStep from "./AddressDetailsStep"
import LocationStep from "./LocationStep"
import AddressOptionalDetails from "./AddressOptionalDetails"
import { Spinner } from "@/components/ui/spinner"

const LAST_STEP = ADDRESS_STEP_FIELDS.length - 1

// All panels stay mounted (so local state in AddressDetailsStep survives),
// inactive ones are simply display:none. Nothing is measured, so there is
// no dependency on dialog animation timing or container width.
function StepPanel({
  active,
  children,
}: {
  active: boolean
  children: ReactNode
}) {
  return (
    <div
      hidden={!active}
      aria-hidden={!active}
      className={
        active
          ? "flex animate-in flex-col gap-5 py-5 duration-200 fade-in-0 slide-in-from-right-4"
          : undefined
      }
    >
      {children}
    </div>
  )
}

function AddressModalSteps({
  addresses,
  addressValues,
  isEditing,
  isPending,
}: {
  addresses: Address[]
  addressValues?: Address
  isEditing: boolean
  isPending: boolean
}) {
  const { trigger } = useFormContext<AddressInput>()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = async () => {
    const fields = ADDRESS_STEP_FIELDS[currentStep]

    if (fields.length > 0) {
      const valid = await trigger(fields)
      if (!valid) return
    }

    setCurrentStep((step) => Math.min(step + 1, LAST_STEP))
  }

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  return (
    <div className="w-full min-w-0">
      <p className="mt-1 text-xs text-muted-foreground">
        Step {currentStep + 1} of {LAST_STEP + 1}
      </p>

      <StepPanel active={currentStep === 0}>
        <AddressLabelStep addresses={addresses} addressValues={addressValues} />
      </StepPanel>

      <StepPanel active={currentStep === 1}>
        <RecipientStep />
      </StepPanel>

      <StepPanel active={currentStep === 2}>
        <AddressDetailsStep />
      </StepPanel>

      <StepPanel active={currentStep === 3}>
        <AddressOptionalDetails />
      </StepPanel>

      <StepPanel active={currentStep === 4}>
        <LocationStep active={currentStep === 4} />
      </StepPanel>

      <div className="flex items-center">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="min-w-40"
          >
            Back
          </Button>
        )}

        {currentStep < LAST_STEP ? (
          <Button
            type="button"
            onClick={handleNext}
            className="ml-auto min-w-40"
          >
            Next
          </Button>
        ) : (
          <Button type="submit" className="ml-auto min-w-40">
            {isEditing && !isPending ? (
              "Save Changes"
            ) : !isEditing && !isPending ? (
              "Add Address"
            ) : (
              <>
                <Spinner /> <span>Adding Address</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default AddressModalSteps
