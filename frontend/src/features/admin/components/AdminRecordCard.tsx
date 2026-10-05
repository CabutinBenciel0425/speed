import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ClipboardList,
  MessageSquare,
  Package,
  Store,
  Tags,
  Truck,
  UserRound,
} from "lucide-react"
import type { AdminRecord, AdminSection } from "../types/admin"

const text = (value: unknown) =>
  value == null || value === ""
    ? "—"
    : Array.isArray(value)
      ? value.join(", ")
      : typeof value === "object"
        ? "Details available"
        : String(value)

const userName = (value: unknown) => {
  if (!value || typeof value !== "object") return ""
  const person = value as Record<string, unknown>
  return [person.firstName, person.lastName].filter(Boolean).join(" ")
}

export const adminRecordTitle = (section: AdminSection, row: AdminRecord) => {
  if (section === "users") return userName(row) || text(row.email)
  if (section === "merchants") return text(row.merchantName)
  if (section === "drivers") return text(row.plateNumber ?? row.vehicleType)
  if (section === "orders") return `Order ${text(row.orderNumber)}`
  if (section === "products") return text(row.name)
  if (section === "reviews") return `${text(row.rating)} star review`
  return text(row.name)
}

function getFields(
  section: AdminSection,
  row: AdminRecord
): [string, unknown][] {
  const fields: Record<AdminSection, string[]> = {
    users: ["email", "phoneNumber", "role", "isVerified", "createdAt"],
    merchants: [
      "phoneNumber",
      "averageRating",
      "ratingCount",
      "city",
      "createdAt",
    ],
    drivers: [
      "vehicleType",
      "workingStatus",
      "averageRating",
      "completedDeliveries",
    ],
    orders: ["payment", "pricing", "createdAt"],
    products: [
      "price",
      "isAvailable",
      "totalSold",
      "merchantName",
      "createdAt",
    ],
    reviews: ["targetType", "comment", "createdAt"],
    categories: ["slug", "description", "displayOrder"],
  }
  return fields[section]
    .filter((field) => row[field] !== undefined)
    .map((field) => [field, row[field]])
}

function getState(section: AdminSection, row: AdminRecord, status: string) {
  const label =
    section === "products"
      ? row.isAvailable
        ? "Available"
        : "Unavailable"
      : section === "categories"
        ? row.isActive
          ? "Active"
          : "Inactive"
        : section === "reviews"
          ? row.isHidden
            ? "Hidden"
            : "Visible"
          : status
  if (!label) return null

  const tone = [
    "Delivered",
    "Approved",
    "Open",
    "Operational",
    "Active",
    "Paid",
    "Available",
    "Visible",
  ].includes(label)
    ? "border-chart-2/20 bg-chart-2/10 text-chart-2"
    : [
          "Cancelled",
          "Rejected",
          "Suspended",
          "Unavailable",
          "Inactive",
          "Hidden",
        ].includes(label)
      ? "border-destructive/20 bg-destructive/10 text-destructive"
      : ["Pending", "Preparing", "ReadyForPickup", "PickedUp"].includes(label)
        ? "border-chart-3/20 bg-chart-3/10 text-chart-3"
        : "border-border bg-muted text-muted-foreground"

  return { label, tone }
}

export default function AdminRecordCard({
  section,
  row,
  actionPending,
  onAction,
  onDetail,
  onEditCategory,
}: {
  section: AdminSection
  row: AdminRecord
  actionPending: boolean
  onAction: (row: AdminRecord, value?: string) => void
  onDetail: (row: AdminRecord, title: string) => void
  onEditCategory: (row: AdminRecord) => void
}) {
  const title = adminRecordTitle(section, row)
  const status = String(row.status ?? "")
  const isAdmin =
    section === "users" && Array.isArray(row.role) && row.role.includes("Admin")
  const canDetail = !["products", "categories"].includes(section)
  const SectionIcon = {
    users: UserRound,
    merchants: Store,
    drivers: Truck,
    orders: ClipboardList,
    products: Package,
    reviews: MessageSquare,
    categories: Tags,
  }[section]
  const state = getState(section, row, status)

  return (
    <Card className="border-border/60 py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/60 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <SectionIcon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <CardTitle className="truncate">{title}</CardTitle>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              ID: {row._id}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {state && (
            <Badge variant="outline" className={state.tone}>
              {state.label}
            </Badge>
          )}
          {canDetail && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDetail(row, title)}
            >
              Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm min-[460px]:grid-cols-2">
          {getFields(section, row).map(([field, value]) => (
            <div className="min-w-0" key={field}>
              <dt className="text-xs text-muted-foreground capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </dt>
              <dd className="break-words">{text(value)}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {section === "users" && !isAdmin && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionPending}
              onClick={() => {
                if (window.confirm(`Deactivate ${title}?`)) onAction(row)
              }}
            >
              Deactivate
            </Button>
          )}
          {section === "merchants" && (
            <StatusSelect
              title={title}
              value={status}
              disabled={actionPending}
              options={[
                "Pending",
                "Approved",
                "Open",
                "Closed",
                "Rejected",
                "Suspended",
              ]}
              onChange={(value) => onAction(row, value)}
            />
          )}
          {section === "drivers" && (
            <StatusSelect
              title={title}
              value={status}
              disabled={actionPending}
              options={["Pending", "Operational", "Suspended"]}
              onChange={(value) => onAction(row, value)}
            />
          )}
          {section === "orders" &&
            !["Delivered", "Cancelled", "Rejected"].includes(status) && (
              <Button
                size="sm"
                variant="outline"
                disabled={actionPending}
                onClick={() => {
                  if (window.confirm(`Cancel order ${text(row.orderNumber)}?`))
                    onAction(row)
                }}
              >
                Cancel order
              </Button>
            )}
          {section === "products" && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={actionPending}
                onClick={() => onAction(row)}
              >
                {row.isAvailable ? "Mark unavailable" : "Mark available"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={actionPending}
                onClick={() => {
                  if (window.confirm(`Delete ${title}?`))
                    onAction(row, "delete")
                }}
              >
                Delete product
              </Button>
            </>
          )}
          {section === "reviews" && !row.isHidden && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionPending}
              onClick={() => onAction(row)}
            >
              Hide review
            </Button>
          )}
          {section === "categories" && (
            <>
              <span className="text-sm text-muted-foreground">
                {row.isActive ? "Active" : "Inactive"}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={actionPending}
                onClick={() => onAction(row)}
              >
                Toggle active
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditCategory(row)}
              >
                Edit
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusSelect({
  title,
  value,
  options,
  disabled,
  onChange,
}: {
  title: string
  value: string
  options: string[]
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      Status
      <select
        aria-label={`Status for ${title}`}
        className="h-9 rounded-md border border-input bg-background px-2"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  )
}
