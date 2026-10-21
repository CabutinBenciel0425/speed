import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AdminSection } from "../types/admin"
import { useAdminDetails } from "../hooks/useAdminData"
import PageError from "@/components/common/PageError"
import { Skeleton } from "@/components/ui/skeleton"

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
  const { data, isLoading, isError, refetch, isFetching } = useAdminDetails(section, id)
  return (
    <Dialog open={Boolean(id)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Record details</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="status" aria-label="Loading record details">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        ) : isError || !data ? (
          <PageError
            message="Could not load record details. Please try again."
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
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
