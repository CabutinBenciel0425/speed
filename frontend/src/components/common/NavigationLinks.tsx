import { NavLink } from "react-router-dom"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu"
import { Heart, PaperBag, ShoppingCart } from "lucide-react"

function NavigationLinks() {
  return (
    <NavigationMenu>
      <NavigationMenuList className={"flex flex-row gap-2 2xl:gap-10"}>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            render={
              <NavLink to="/orders" className={"flex flex-row gap-2"}>
                <PaperBag className="size-6" />
                <span className="text-md">Orders</span>
              </NavLink>
            }
          />
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            render={
              <NavLink to="/favorites" className={"flex flex-row gap-2"}>
                <Heart className="size-6" />
                <span className="text-md">Favorites</span>
              </NavLink>
            }
          />
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            render={
              <NavLink to="/cart" className={"relative flex flex-row gap-2"}>
                <ShoppingCart className="size-6" />
                <span className="text-md">Cart</span>
                <span className="absolute -top-3 -right-3 rounded-full bg-primary px-2.5 py-1">
                  5
                </span>
              </NavLink>
            }
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default NavigationLinks
