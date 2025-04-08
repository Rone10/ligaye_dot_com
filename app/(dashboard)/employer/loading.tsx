// app/(dashboard)/employer/loading.tsx

import { Skeleton } from "@/components/ui/skeleton"

 function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export default Loading;