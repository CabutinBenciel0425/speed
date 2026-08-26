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
      className={`flex h-8 flex-row items-center rounded-2xl px-2 transition-all duration-300 md:h-10 ${!isAuthenticated ? "hidden md:flex md:w-full lg:w-120" : "w-full"}`}
    >
      <InputGroupInput
        placeholder="Search for food or restaurant"
        type="search"
        className="lg:text-md flex-1 bg-transparent py-1 text-xs outline-none md:text-sm"
      />
      <InputGroupAddon align="inline-end" className="flex items-center">
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
      </InputGroupAddon>
    </InputGroup>
  )
}

export default Searchbar
