import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import type { AddressLabel } from "@/types/address"

function LabelWithRadio({
  type,
  onRegisteredLabel,
}: {
  type: AddressLabel
  onRegisteredLabel: (value: AddressLabel) => boolean
}) {
  return (
    <Label
      className={`flex items-center justify-center rounded-sm border-2 px-3 py-2 text-xs lg:text-sm ${onRegisteredLabel(type) ? "cursor-not-allowed bg-muted-foreground/10 text-muted-foreground" : "cursor-pointer border-primary bg-primary/5 transition duration-300 ease-in-out active:scale-95"}`}
      htmlFor={type}
    >
      <span className="ml-6">{type}</span>
      <RadioGroupItem value={type} id={type} className={"invisible"} />
    </Label>
  )
}

export default LabelWithRadio
