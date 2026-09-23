import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useAddress } from "@/hooks/useAddress"
import { useAuth } from "@/hooks/useAuth"
import { MapPin } from "lucide-react"
import { AiFillStar } from "react-icons/ai"

function FilterMerchants({
  ratingKey,
  open,
  maxDist,
  onHandleToggleOpen,
  onHandleRatingChange,
  onHandleDistanceChange,
  onHandleReset,
}: {
  ratingKey: string
  open: boolean
  maxDist: number
  onHandleToggleOpen: (value: boolean) => void
  onHandleRatingChange: (value: string) => void
  onHandleDistanceChange: (value: string) => void
  onHandleReset: () => void
}) {
  const { defaultAddress } = useAddress()
  const { isAuthenticated } = useAuth()
  const selectedDistance = maxDist === 0 ? "50+" : String(maxDist)

  return (
    <Accordion
      multiple
      className="min-w-3xs rounded-md bg-muted-foreground/10 px-4"
      defaultValue={["open-now", `${ratingKey !== "0-5" ? "rating" : ""}`]}
    >
      {/*Open now*/}
      <AccordionItem
        className={"w-full py-4"}
        key={"open-now"}
        value={"open-now"}
      >
        <AccordionTrigger className={"text-md font-semibold"}>
          Availability
        </AccordionTrigger>
        <AccordionContent key={"open-now"} className={"mt-2.5"}>
          <label className="flex max-h-2 flex-row items-center justify-between gap-2">
            <Label htmlFor="open-now">Open Now</Label>
            <Switch
              id="open-now"
              checked={open}
              onCheckedChange={onHandleToggleOpen}
            />
          </label>
        </AccordionContent>
      </AccordionItem>

      {/*Rating*/}
      <AccordionItem
        className={`w-full py-4 ${defaultAddress && isAuthenticated ? "" : "mb-5"}`}
        key={"rating"}
      >
        <AccordionTrigger className={"text-md font-semibold"}>
          Rating
        </AccordionTrigger>
        <RadioGroup onValueChange={onHandleRatingChange} value={ratingKey}>
          <AccordionContent key={"rating_0-3"} className={"mt-2.5"}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="0-3" id="0-3" />
              <Label htmlFor="0-3">
                0 - 3.0 Stars{" "}
                <AiFillStar className="mt-0.5 text-lg text-yellow-500" />
              </Label>
            </div>
          </AccordionContent>

          <AccordionContent key={"rating_3.1-4.0"} className={"mt-2.5"}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="3.1-4.0" id="3.1-4.0" />
              <Label htmlFor="3.1-4.0">
                3.1 - 4.0 Stars{" "}
                <AiFillStar className="mt-0.5 text-lg text-yellow-500" />
              </Label>
            </div>
          </AccordionContent>

          <AccordionContent key={"rating_4.1-4.5"} className={"mt-2.5"}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="4.1-4.5" id="4.1-4.5" />
              <Label htmlFor="4.1-4.5">
                4.1 - 4.5 Stars{" "}
                <AiFillStar className="mt-0.5 text-lg text-yellow-500" />
              </Label>
            </div>
          </AccordionContent>

          <AccordionContent key={"rating_4.6-5.0"} className={"mt-2.5"}>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="4.6-5.0" id="4.6-5.0" />
              <Label htmlFor="4.6-5.0">
                4.6 - 5.0 Stars{" "}
                <AiFillStar className="mt-0.5 text-lg text-yellow-500" />
              </Label>
            </div>
          </AccordionContent>
        </RadioGroup>
      </AccordionItem>

      {/*Location*/}
      {defaultAddress && isAuthenticated && (
        <AccordionItem className={"mb-5 w-full py-4"} key={"location"}>
          <AccordionTrigger className={"text-md font-semibold"}>
            Location
          </AccordionTrigger>
          <RadioGroup
            onValueChange={onHandleDistanceChange}
            value={selectedDistance}
          >
            <AccordionContent key={"location_5"} className={"mt-2.5"}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="5" id="5" />
                <Label htmlFor="5">
                  5.0 Kms <MapPin className="size-5" />
                </Label>
              </div>
            </AccordionContent>

            <AccordionContent key={"location_10"} className={"mt-2.5"}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="10" id="10" />
                <Label htmlFor="10">
                  10.0 Kms <MapPin className="size-5" />
                </Label>
              </div>
            </AccordionContent>

            <AccordionContent key={"location_25"} className={"mt-2.5"}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="25" id="25" />
                <Label htmlFor="25">
                  25.0 Kms <MapPin className="size-5" />
                </Label>
              </div>
            </AccordionContent>

            <AccordionContent key={"location_50"} className={"mt-2.5"}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="50" id="50" />
                <Label htmlFor="50">
                  50.0 Kms <MapPin className="size-5" />
                </Label>
              </div>
            </AccordionContent>

            <AccordionContent key={"location_50+"} className={"mt-2.5"}>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="50+" id="50+" />
                <Label htmlFor="50+">
                  50+ Kms <MapPin className="size-5" />
                </Label>
              </div>
            </AccordionContent>
          </RadioGroup>
        </AccordionItem>
      )}

      <Button
        type="reset"
        onClick={onHandleReset}
        className={"mb-5 w-full border border-muted-foreground/10"}
        variant={"ghost"}
      >
        Clear Filters
      </Button>
    </Accordion>
  )
}

export default FilterMerchants
