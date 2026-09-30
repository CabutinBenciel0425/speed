import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import type { AddressLabel } from "@/types/address"
import { BriefcaseBusiness, House, LayoutDashboard } from "lucide-react"

function LabelWithRadio({
  type,
  onRegisteredLabel,
}: {
  type: AddressLabel
  onRegisteredLabel: (value: AddressLabel) => boolean
}) {
  const registered = onRegisteredLabel(type)

  return (
    <Label
      htmlFor={type}
      className={`flex cursor-pointer flex-row items-center gap-2 rounded-sm border-2 px-4 py-3 ${
        registered
          ? "cursor-not-allowed bg-muted-foreground/10 text-muted-foreground"
          : "border-primary bg-primary/5"
      }`}
    >
      <RadioGroupItem
        value={type}
        id={type}
        disabled={registered}
        className={"hidden"}
      />
      {type === "Home" && (
        <House
          stroke={registered ? "#6b7280" : "#ff6b00"}
          className={`size-8 ${!registered ? "" : "rounded-full bg-muted-foreground/20"} p-3 md:size-10 lg:size-12`}
        />
      )}
      {type === "Work" && (
        <BriefcaseBusiness
          stroke={registered ? "#6b7280" : "#ff6b00"}
          className={`size-8 ${!registered ? "" : "rounded-full bg-muted-foreground/20"} p-3 md:size-10 lg:size-12`}
        />
      )}
      {type === "Other" && (
        <LayoutDashboard
          stroke={registered ? "#6b7280" : "#ff6b00"}
          className={`size-8 ${!registered ? "" : "rounded-full bg-muted-foreground/20"} p-3 md:size-10 lg:size-12`}
        />
      )}
      <span>{type}</span>
    </Label>
  )
}

export default LabelWithRadio
