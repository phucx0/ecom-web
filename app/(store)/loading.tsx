import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {return <div aria-busy="true" role="status" className="space-y-6"><span className="sr-only">Đang tải sản phẩm…</span><Skeleton className="h-8 w-56" /><Skeleton className="h-20 w-full" /><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{Array.from({length:4},(_,i)=><Skeleton key={i} className="aspect-[3/4]" />)}</div></div>;}

