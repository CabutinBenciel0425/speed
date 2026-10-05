import { useEffect, useState, type FormEvent } from "react"
import type { Product } from "@/features/customer/types/products"
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

export type MerchantProductCategory = {
  id: string
  name: string
  slug: string
}

type ProductForm = {
  name: string
  category: string
  description: string
  price: string
  preparationTime: string
  ingredients: string
  tags: string
  image: File | null
}

type MerchantProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: MerchantProductCategory[]
  isSaving: boolean
  onSave: (payload: FormData, productId?: string) => void
}

const emptyForm: ProductForm = {
  name: "",
  category: "",
  description: "",
  price: "",
  preparationTime: "15",
  ingredients: "",
  tags: "",
  image: null,
}

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

function MerchantProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  isSaving,
  onSave,
}: MerchantProductFormDialogProps) {
  const [form, setForm] = useState<ProductForm>(emptyForm)

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      product
        ? {
            name: product.name,
            category: product.category,
            description: product.description ?? "",
            price: String(product.price),
            preparationTime: String(product.preparationTime),
            ingredients: product.ingredients.join(", "),
            tags: product.tags.join(", "),
            image: null,
          }
        : emptyForm
    )
  }, [open, product])

  const submitProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = new FormData()
    payload.set("name", form.name.trim())
    payload.set("category", form.category)
    payload.set("description", form.description.trim())
    payload.set("price", form.price)
    payload.set("preparationTime", form.preparationTime)
    payload.set("ingredients", JSON.stringify(splitList(form.ingredients)))
    payload.set("tags", JSON.stringify(splitList(form.tags)))
    payload.set("isAvailable", String(product?.isAvailable ?? true))
    payload.set("isFeatured", String(product?.isFeatured ?? false))
    if (form.image) payload.set("image", form.image)
    onSave(payload, product?._id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit product" : "Add a product"}
          </DialogTitle>
          <DialogDescription>
            Add product details, then choose a category from your menu.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submitProduct} className="space-y-4">
          <label className="block space-y-1 text-sm">
            Product name
            <Input
              required
              minLength={2}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="mt-1"
            />
          </label>
          <label className="block space-y-1 text-sm">
            Category
            <select
              required
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
              className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm">
              Price (₱)
              <Input
                required
                type="number"
                min="0"
                max="100000"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: event.target.value })
                }
                className="mt-1"
              />
            </label>
            <label className="space-y-1 text-sm">
              Preparation time (mins)
              <Input
                required
                type="number"
                min="0"
                max="600"
                value={form.preparationTime}
                onChange={(event) =>
                  setForm({ ...form, preparationTime: event.target.value })
                }
                className="mt-1"
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            Description
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            Ingredients{" "}
            <span className="text-muted-foreground">(comma separated)</span>
            <Input
              value={form.ingredients}
              onChange={(event) =>
                setForm({ ...form, ingredients: event.target.value })
              }
              className="mt-1"
            />
          </label>
          <label className="block space-y-1 text-sm">
            Tags{" "}
            <span className="text-muted-foreground">(comma separated)</span>
            <Input
              value={form.tags}
              onChange={(event) =>
                setForm({ ...form, tags: event.target.value })
              }
              className="mt-1"
            />
          </label>
          <label className="block space-y-1 text-sm">
            Product image
            <Input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setForm({ ...form, image: event.target.files?.[0] ?? null })
              }
              className="mt-1"
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
              {isSaving
                ? "Saving…"
                : product
                  ? "Save changes"
                  : "Create product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default MerchantProductFormDialog
