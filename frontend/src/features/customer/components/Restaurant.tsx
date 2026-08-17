import MerchantCard from "@/components/common/MerchantCard"
import ViewAllButton from "@/components/common/ViewAllButton"

function Restaurant() {
  return (
    <div className="flex flex-col gap-5 px-5">
      <div className="flex items-center justify-between">
        <p className="block text-lg font-semibold">Popular restaurants</p>
        <ViewAllButton />
      </div>
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4">
        <MerchantCard />
        <MerchantCard />
        <MerchantCard />
        <MerchantCard />
        <MerchantCard />
        <MerchantCard />
        <MerchantCard />
        <MerchantCard />
      </div>
    </div>
  )
}

export default Restaurant
