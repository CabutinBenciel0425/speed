import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, MapPin } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export function Addressbar() {
  const [position, setPosition] = useState("bottom")

  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" className={"h-14 bg-gray-100"}>
              <div>
                <MapPin className="size-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Deliver to</p>
                <p className="text-md font-semibold">Manila, Philippines</p>
              </div>
              <div>
                <ChevronDown />
              </div>
            </Button>
          }
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8 }}
        >
          <DropdownMenuContent className="w-100">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Addresses</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={position}
                onValueChange={setPosition}
              >
                <DropdownMenuRadioItem value="top">
                  Building 4 Unit 104 FTI MRB Habitat Western Bicutan Taguig
                  City
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="bottom">
                  Building 4 Unit 104 FTI MRB Habitat Western Bicutan Taguig
                  City
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="right">
                  Building 4 Unit 104 FTI MRB Habitat Western Bicutan Taguig
                  City
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </motion.div>
      </DropdownMenu>
    </div>
  )
}
