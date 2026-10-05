import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AdminSection } from "../types/admin"
import { useAdminDetails } from "../hooks/useAdminData"

const printable = (value: unknown) => {
  if (value == null || value === "") return "—"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export default function AdminDetailDialog({
  section,
  id,
  title,
  onOpenChange,
}: {
  section: AdminSection
  id: string | null
  title: string
  onOpenChange: (open: boolean) => void
}) {
  const { data, isLoading, isError } = useAdminDetails(section, id)
  return (
    <Dialog open={Boolean(id)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Record details</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading details…</p>
        ) : isError || !data ? (
          <p className="text-sm text-destructive">Could not load details.</p>
        ) : (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(data)
              .filter(([key]) => !["__v", "password"].includes(key))
              .map(([key, value]) => (
                <div className="min-w-0 space-y-1" key={key}>
                  <dt className="text-xs text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </dt>
                  <dd className="text-sm break-words">{printable(value)}</dd>
                </div>
              ))}
          </dl>
        )}
      </DialogContent>
    </Dialog>
  )
}
