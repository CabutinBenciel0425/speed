import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useAuth } from "@/hooks/useAuth"
import { useDebounce } from "@/hooks/useDebounce"
import { useSearchDropdownPublic } from "@/hooks/useSearchDropdownPublic"
import { SearchIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import SearchDropdown from "../../features/customer/components/SearchDropdown"
import { useLocation, useNavigate } from "react-router-dom"

function Searchbar() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 500)
  const { merchants, products, isLoading } =
    useSearchDropdownPublic(debouncedQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  useEffect(() => {
    const hasQuery = query.trim().length > 0

    if (hasQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDropdownOpen(true)
    } else {
      setIsDropdownOpen(false)
    }
  }, [query, products, merchants, isLoading])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false)
        inputRef.current?.blur()
      }

      if (e.key === "Enter") {
        setIsDropdownOpen(false)

        navigate(`/search?query=${encodeURIComponent(debouncedQuery)}`)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [navigate, debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDropdownOpen(false)
  }, [pathname])

  return (
    <InputGroup
      className={`flex h-8 flex-row items-center rounded-2xl px-2 transition-all duration-300 md:h-10 ${!isAuthenticated ? "hidden md:flex md:w-full lg:w-120" : "w-full"}`}
    >
      <div className="relative w-full" ref={dropdownRef}>
        <InputGroupInput
          ref={inputRef}
          placeholder="Search for food or restaurant"
          type="search"
          className="flex-1 bg-transparent py-1 text-xs outline-none md:text-sm lg:text-base"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (
              query.trim().length > 0 &&
              (products.length > 0 || merchants.length > 0)
            ) {
              setIsDropdownOpen(true)
            }
          }}
        />
        <SearchDropdown
          products={products}
          merchants={merchants}
          isDropdownOpen={isDropdownOpen}
          isLoading={isLoading}
        />
      </div>

      <InputGroupAddon align="inline-end" className="flex items-center">
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
      </InputGroupAddon>
    </InputGroup>
  )
}

export default Searchbar
