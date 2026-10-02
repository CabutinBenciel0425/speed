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

  const iconProps = {
    stroke: registered ? "#6b7280" : "#ff6b00",
    className: `size-12 p-3 md:size-13 lg:size-14 ${
      registered ? "rounded-full bg-muted-foreground/20" : ""
    }`,
  }

  return (
    <Label
      aria-disabled={registered}
      className={`flex flex-col items-center justify-start gap-2 rounded-sm border-2 px-10 py-3 transition-colors ${
        registered
          ? "cursor-not-allowed bg-muted-foreground/10 text-muted-foreground"
          : "cursor-pointer border-primary/40 bg-primary/5 hover:border-primary has-data-checked:border-primary has-data-checked:bg-primary/15 has-data-checked:ring-2 has-data-checked:ring-primary/30"
      }`}
    >
      {/* sr-only (not display:none) keeps the control focusable and in the a11y tree */}
      <RadioGroupItem value={type} disabled={registered} className="sr-only" />

      {type === "Home" && <House {...iconProps} />}
      {type === "Work" && <BriefcaseBusiness {...iconProps} />}
      {type === "Other" && <LayoutDashboard {...iconProps} />}

      <span>{type}</span>
    </Label>
  )
}

export default LabelWithRadio
