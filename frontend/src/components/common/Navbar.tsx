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

function Navbar() {
  const { isAuthenticated, isLoading, isVerified } = useAuth()

  if (isLoading) {
    return <SkeletonNavbar />
  }

  return (
    <>
      <header className="z-50 flex w-full flex-row items-center justify-between gap-1 bg-transparent px-2 py-4 lg:px-10 lg:py-5 xl:gap-5">
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
          <SearchBar />
          {isAuthenticated && <Addressbar />}
        </div>

        <div className="flex w-1/4 flex-row items-center justify-end gap-2 lg:gap-10">
          {isAuthenticated ? (
            <>
              <NavigationLinks />
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
      {!isVerified && <EmailVerifyTab />}
    </>
  )
}

export default Navbar
