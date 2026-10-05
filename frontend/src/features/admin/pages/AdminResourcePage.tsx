import { useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAdminActions, useAdminResource } from "../hooks/useAdminData"
import type { AdminRecord, AdminSection } from "../types/admin"
import AdminCategoryDialog, {
  type AdminCategory,
} from "../components/AdminCategoryDialog"
import AdminDetailDialog from "../components/AdminDetailDialog"
import AdminRecordCard from "../components/AdminRecordCard"

const sections: Record<AdminSection, { title: string; description: string }> = {
  users: {
    title: "Users",
    description: "View customer accounts and manage account access.",
  },
  merchants: {
    title: "Merchants",
    description: "Review merchant profiles and account status.",
  },
  drivers: {
    title: "Drivers",
    description: "Review driver profiles and operational status.",
  },
  orders: {
    title: "Orders",
    description: "Monitor orders across the platform.",
  },
  products: {
    title: "Products",
    description: "Browse menu items published by merchants.",
  },
  reviews: {
    title: "Reviews",
    description: "Review feedback submitted across the platform.",
  },
  categories: {
    title: "Categories",
    description: "Manage categories available to merchants.",
  },
}

export default function AdminResourcePage() {
  const { section: sectionParam } = useParams()
  const section = (sectionParam ?? "users") as AdminSection
  const config = sections[section]
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<{ id: string; title: string } | null>(
    null
  )
  const [category, setCategory] = useState<AdminCategory | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const { data, isLoading, isError } = useAdminResource(section, search, page)
  const { action, saveCategory } = useAdminActions()

  if (!config)
    return (
      <p className="text-sm text-muted-foreground">Unknown admin section.</p>
    )
  const runAction = (row: AdminRecord, value?: string) =>
    action.mutate({ section, id: row._id, value })
  const openDetails = (row: AdminRecord, title: string) =>
    setDetail({ id: row._id, title })
  const openCategory = (row?: AdminRecord) => {
    setCategory(
      row
        ? {
            _id: row._id,
            name: String(row.name ?? ""),
            description:
              typeof row.description === "string" ? row.description : "",
            displayOrder: Number(row.displayOrder ?? 0),
          }
        : null
    )
    setCategoryDialogOpen(true)
  }
  const handleCategorySave = (payload: FormData, id?: string) =>
    saveCategory.mutate(
      { payload, id },
      {
        onSuccess: () => {
          setCategoryDialogOpen(false)
          setCategory(null)
        },
      }
    )

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        {section === "categories" && (
          <Button onClick={() => openCategory()}>Add category</Button>
        )}
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          className="w-full sm:max-w-sm"
          placeholder={`Search ${config.title.toLowerCase()}…`}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        {data && (
          <span className="text-sm text-muted-foreground">
            {data.pagination.total.toLocaleString()} records
          </span>
        )}
      </div>
      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading {config.title.toLowerCase()}…
        </p>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-destructive">
          Could not load {config.title.toLowerCase()}.
        </p>
      ) : data?.data.length ? (
        <>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {data.data.map((row) => (
              <AdminRecordCard
                key={row._id}
                section={section}
                row={row}
                actionPending={action.isPending}
                onAction={runAction}
                onDetail={openDetails}
                onEditCategory={openCategory}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Page {data.pagination.page} of{" "}
              {Math.max(data.pagination.pages, 1)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No {config.title.toLowerCase()} found.
        </p>
      )}
      {detail && (
        <AdminDetailDialog
          section={section}
          id={detail.id}
          title={detail.title}
          onOpenChange={(open) => {
            if (!open) setDetail(null)
          }}
        />
      )}
      {section === "categories" && (
        <AdminCategoryDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          category={category}
          isSaving={saveCategory.isPending}
          onSave={handleCategorySave}
        />
      )}
    </div>
  )
}
