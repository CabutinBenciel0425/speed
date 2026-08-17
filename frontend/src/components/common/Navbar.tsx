import speedIconSmall from "@/assets/speed-sm.png"
import SearchBar from "./Searchbar"
import { Addressbar } from "./Addressbar"
import NavigationLinks from "./NavigationLinks"
import { ProfileButton } from "./ProfileButton"
import { NavLink } from "react-router-dom"

function Navbar() {
  return (
    <header className="flex w-full flex-row items-center justify-between gap-1 px-2 py-4 lg:px-10 lg:py-5 xl:gap-5">
      <div className="mr-5 w-1/4 shrink-0 lg:mr-0">
        <div className="w-fit">
          <NavLink to="/customer/dashboard">
            <img
              src={speedIconSmall}
              alt="speed small"
              className="w-30 cursor-pointer"
            />
          </NavLink>
        </div>
      </div>
      <div className="flex w-2/4 flex-row items-center justify-between gap-2 lg:gap-10">
        <Addressbar />
        <SearchBar />
      </div>

      <div className="flex w-1/4 flex-row items-center justify-end gap-2 lg:gap-10">
        <NavigationLinks />
        <ProfileButton />
      </div>
    </header>
  )
}

export default Navbar
