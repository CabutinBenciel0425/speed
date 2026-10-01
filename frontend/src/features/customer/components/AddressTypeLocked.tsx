import { Field, FieldLabel } from "@/components/ui/field"
import type { AddressLabel } from "@/types/address"
import { BriefcaseBusiness, House, LayoutDashboard, Lock } from "lucide-react"

function AddressTypeLocked({ label }: { label: AddressLabel }) {
  return (
    <Field>
      <FieldLabel className="text-xs lg:text-sm">Address type</FieldLabel>
      <div className="flex flex-row items-center justify-start gap-3 rounded-sm border border-muted-foreground/50 bg-muted-foreground/10 px-4 py-2">
        {label === "Home" && (
          <House stroke="#ff6b00" className="size-3 lg:size-5" />
        )}
        {label === "Work" && (
          <BriefcaseBusiness stroke="#ff6b00" className="size-3 lg:size-5" />
        )}
        {label === "Other" && (
          <LayoutDashboard stroke="#ff6b00" className="size-3 lg:size-5" />
        )}
        <p className="text-sm font-semibold lg:text-base">{label}</p>
        <Lock stroke="#6b7280" className="size-4" />
        <p className="text-xs text-muted-foreground">
          Address type cannot be changed
        </p>
      </div>
    </Field>
  )
}

export default AddressTypeLocked
