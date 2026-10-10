import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type AdminCategory = {
  _id: string
  name: string
  description?: string
  displayOrder: number
}

export default function AdminCategoryDialog({
  open,
  onOpenChange,
  category,
  isSaving,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: AdminCategory | null
  isSaving: boolean
  onSave: (payload: FormData, id?: string) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [displayOrder, setDisplayOrder] = useState("")
  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(category?.name ?? "")
    setDescription(category?.description ?? "")
    setDisplayOrder(category ? String(category.displayOrder) : "")
  }, [open, category])
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const payload = new FormData()
    payload.set("name", name.trim())
    payload.set("description", description.trim())
    if (displayOrder !== "") payload.set("displayOrder", displayOrder)
    onSave(payload, category?._id)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit category" : "Add category"}
          </DialogTitle>
          <DialogDescription>
            Manage the categories shown in menus.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-1 text-sm">
            Name
            <Input
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            Description
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            Display order
            <Input
              type="number"
              min="0"
              placeholder="Assigned automatically"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
