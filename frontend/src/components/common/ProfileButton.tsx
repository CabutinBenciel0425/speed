import {
  BellIcon,
  File,
  Heart,
  LogOutIcon,
  PaperBag,
  ShoppingCart,
} from "lucide-react"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useLogout } from "@/features/auth/hooks/useLogout"

export function ProfileButton() {
  const { user } = useAuth()
  const { mutate: logout } = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-lg" className="rounded-full">
            <Avatar>
              <AvatarImage src={user?.avatar} alt={user?.firstName} />
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className={"block md:hidden"}>
            <NavLink to="/cart" className={"flex flex-row gap-2"}>
              <ShoppingCart className="size-4 lg:size-5" />
              <span className="text-xs md:text-sm lg:text-base">Cart</span>
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <NavLink to="/orders" className={"flex flex-row gap-2"}>
              <PaperBag className="size-4 lg:size-5" />
              <span className="text-xs md:text-sm lg:text-base">Orders</span>
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <NavLink to="/favorites" className={"flex flex-row gap-2"}>
              <Heart className="size-4 lg:size-5" />
              <span className="text-xs md:text-sm lg:text-base">Favorites</span>
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <NavLink to="/reviews" className={"flex flex-row gap-2"}>
              <File className="size-4 lg:size-5" />
              <span className="text-xs md:text-sm lg:text-base">Reviews</span>
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <NavLink to="/notifications" className={"flex flex-row gap-2"}>
              <BellIcon className="size-4 lg:size-5" />
              <span className="text-xs md:text-sm lg:text-base">
                Notifications
              </span>
            </NavLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOutIcon className="size-4 lg:size-5" />
          <span className="text-xs md:text-sm lg:text-base">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
