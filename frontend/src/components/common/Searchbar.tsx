import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon } from "lucide-react"

function Searchbar() {
  return (
    <InputGroup className="h-12 w-40 grow-0 rounded-2xl px-2 transition-all duration-300 sm:w-70 2xl:focus-within:w-160">
      <InputGroupInput
        placeholder="Search for food or restaurant"
        type="search"
      />
      <InputGroupAddon align="inline-end">
        <SearchIcon className="h-8 w-8" />
      </InputGroupAddon>
    </InputGroup>
  )
}

export default Searchbar
