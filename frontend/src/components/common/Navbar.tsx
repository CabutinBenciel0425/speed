import speedIconSmall from "@/assets/speed-sm.png"
import SearchBar from "./Searchbar"
import { Addressbar } from "./Addressbar"
import NavigationLinks from "./NavigationLinks"
import { ProfileButton } from "./ProfileButton"
import { NavLink } from "react-router-dom"
import { Button } from "../ui/button"
import { useAuth } from "@/hooks/useAuth"
import SkeletonNavbar from "./Skeleton/SkeletonNavbar"
import EmailVerifyTab from "./EmailVerifyTab"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

function Navbar() {
  const { user, activeRole, isAuthenticated, isLoading, isVerified } = useAuth()

  if (isLoading) {
    return <SkeletonNavbar />
  }

  return (
    <>
      <header className="z-90 flex w-full flex-row items-center justify-between gap-1 bg-transparent px-2 py-4 lg:px-10 lg:py-5 xl:gap-5">
        <div className="mr-5 w-1/4 shrink-0 lg:mr-0">
          <div className="w-fit">
            <NavLink to="/">
              <img
                src={speedIconSmall}
                alt="speed small"
                className="w-30 cursor-pointer"
              />
            </NavLink>
          </div>
        </div>
        <div
          className={`flex w-2/4 flex-row items-center justify-between gap-2 lg:gap-10 ${!isAuthenticated ? "justify-center" : ""}`}
        >
          {(!isAuthenticated || activeRole === "Customer") && <SearchBar />}
          {isAuthenticated && activeRole === "Customer" && <Addressbar />}
        </div>

        <div className="flex w-1/4 flex-row items-center justify-end gap-2 lg:gap-10">
          {isAuthenticated &&
            activeRole === "Customer" &&
            (!user?.role.includes("Merchant") ||
              !user?.role.includes("Driver")) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="lg" variant="outline" className="gap-2">
                      <span className="hidden sm:inline">Join Speed</span>
                      <ChevronDown className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent>
                  {!user?.role.includes("Merchant") && (
                    <DropdownMenuItem>
                      <NavLink className="w-full" to="/register/merchant">
                        Sign up as a merchant
                      </NavLink>
                    </DropdownMenuItem>
                  )}
                  {!user?.role.includes("Driver") && (
                    <DropdownMenuItem>
                      <NavLink className="w-full" to="/register/driver">
                        Sign up as a driver
                      </NavLink>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

          {isAuthenticated ? (
            <>
              {activeRole === "Customer" && <NavigationLinks />}
              <ProfileButton />
            </>
          ) : (
            <div className="flex flex-row gap-2">
              <NavLink to="/login">
                <Button size={"lg"} variant={"outline"}>
                  Login
                </Button>
              </NavLink>
              <NavLink to="/register">
                <Button size={"lg"}>Register</Button>
              </NavLink>
            </div>
          )}
        </div>
      </header>
      {user && !isVerified && <EmailVerifyTab />}
    </>
  )
}

export default Navbar
