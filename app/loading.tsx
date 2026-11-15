import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <main id="main-content" tabIndex={-1} className="shop-container space-y-5 py-10" aria-busy="true" role="status"><Skeleton className="h-8 w-56" /><Skeleton className="h-40" /><span className="sr-only">Đang tải nội dung…</span></main>; }
