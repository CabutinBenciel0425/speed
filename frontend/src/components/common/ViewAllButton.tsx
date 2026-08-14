import { Button } from "../ui/button"

function ViewAllButton() {
  return (
    <Button
      variant={"ghost"}
      className={
        "text-md text-primary hover:bg-transparent hover:text-speed-orange-hover hover:underline"
      }
    >
      View all
    </Button>
  )
}

export default ViewAllButton
