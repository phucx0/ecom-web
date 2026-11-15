import Link from "next/link";
import { ChevronRight } from "lucide-react";
export function Breadcrumbs({items}:{items:{label:string;href?:string}[]}) {
  return <nav aria-label="Đường dẫn trang"><ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">{items.map((item,index)=><li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">{index>0&&<ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />}{item.href?<Link href={item.href} className="inline-flex min-h-9 items-center hover:text-primary">{item.label}</Link>:<span aria-current="page" className="line-clamp-2 text-foreground">{item.label}</span>}</li>)}</ol></nav>;
}
