import RingLoaderSpinner from '@/components/loaders/ring-loader'

export default function Loading() {
  return (
    <div className='flex justify-center items-center h-screen container mx-auto'>
      <RingLoaderSpinner />
    </div>
  )
} 