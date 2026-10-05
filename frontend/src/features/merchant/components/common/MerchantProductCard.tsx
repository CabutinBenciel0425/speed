import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import type { Product } from "@/features/customer/types/products"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type MerchantProductCardProps = {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onToggleAvailability: (product: Product) => void
  isUpdating?: boolean
}

function MerchantProductCard({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
  isUpdating = false,
}: MerchantProductCardProps) {
  return (
    <Card className="mx-auto w-full max-w-2xs gap-3 overflow-visible border py-0 shadow-sm">
      <img
        src={
          product.image ??
          `https://placeholderimage.co/400x240/f3f4f6/374151/?text=${encodeURIComponent(product.name)}`
        }
        alt={product.name}
        className="z-20 aspect-video w-full object-contain"
      />
      <CardHeader className="gap-1 px-3 pt-0">
        <CardTitle className="line-clamp-1 text-sm font-semibold">
          {product.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-8 text-xs leading-4">
          {product.description || "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between px-3 pb-2">
        <span className="text-sm font-bold">₱{product.price}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            product.isAvailable
              ? "bg-emerald-200 text-emerald-700"
              : "bg-red-300 text-red-700"
          }`}
        >
          {product.isAvailable ? "Available" : "Unavailable"}
        </span>
      </CardContent>
      <div className="flex items-center gap-1 px-3 pb-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden h-7 flex-1 text-xs sm:inline-flex"
          disabled={isUpdating}
          onClick={() => onEdit(product)}
        >
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="ml-auto h-7 w-7 text-slate-500"
                aria-label={`Actions for ${product.name}`}
                disabled={isUpdating}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              className="sm:hidden"
              onClick={() => onEdit(product)}
            >
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleAvailability(product)}>
              {product.isAvailable ? "Mark unavailable" : "Mark available"}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(product)}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}

export default MerchantProductCard
