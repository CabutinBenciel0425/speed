import { NavLink } from "react-router-dom"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/features/customer/hooks/useCart"

function NavigationLinks() {
  const { itemCount } = useCart()
  return (
    <NavigationMenu className={"hidden md:block"}>
      <NavigationMenuList className={"flex flex-row gap-2 2xl:gap-10"}>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            render={
              <NavLink to="/cart" className={"relative flex flex-row gap-2"}>
                <ShoppingCart className="size-6" />
                <span className="text-base">Cart</span>
                <span
                  className={`absolute -top-3 -right-3 rounded-full ${itemCount > 0 ? "bg-primary" : ""} px-2.5 py-1`}
                >
                  {itemCount === 0 ? "" : itemCount}
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
