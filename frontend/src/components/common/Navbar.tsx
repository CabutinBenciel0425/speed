import speedIconSmall from "@/assets/speed-sm.png"
import SearchBar from "./Searchbar"
import { Addressbar } from "./Addressbar"
import NavigationLinks from "./NavigationLinks"
import { ProfileButton } from "./ProfileButton"
import { NavLink } from "react-router-dom"

function Navbar() {
  return (
    <div>
      <header className="flex flex-row items-center justify-around gap-3 py-2 xl:gap-5">
        <div className="shrink-0">
          <NavLink to="/customer/dashboard">
            <img
              src={speedIconSmall}
              alt="speed small"
              className="w-40 cursor-pointer"
            />
          </NavLink>
        </div>
        <div>
          <Addressbar />
        </div>
        <div>
          <SearchBar />
        </div>
        <div>
          <NavigationLinks />
        </div>
        <div>
          <ProfileButton />
        </div>
      </header>
    </div>
  )
}

export default Navbar
