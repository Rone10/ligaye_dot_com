import RingLoaderSpinner from "@/components/loaders/ring-loader";
import { Skeleton } from "@/components/ui/skeleton"

 function Loading() {
  return (
    <div className='flex justify-center items-center h-screen container mx-auto'>
    <RingLoaderSpinner />
  </div>
  )
}

export default Loading; 