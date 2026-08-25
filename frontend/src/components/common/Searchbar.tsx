import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useAuth } from "@/hooks/useAuth"
import { SearchIcon } from "lucide-react"

function Searchbar() {
  const { isAuthenticated } = useAuth()

  return (
    <InputGroup
      className={`flex h-12 flex-row items-center rounded-2xl px-2 transition-all duration-300 ${!isAuthenticated ? "hidden md:flex md:w-full lg:w-120" : "w-full 2xl:focus-within:w-160"}`}
    >
      <InputGroupInput
        placeholder="Search for food or restaurant"
        type="search"
        className="flex-1 bg-transparent outline-none"
      />
      <InputGroupAddon align="inline-end" className="flex items-center">
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
      </InputGroupAddon>
    </InputGroup>
  )
}

export default Searchbar
