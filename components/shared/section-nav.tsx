"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
export function SectionNav({ items, label }: { items: { href: string; label: string; exact?: boolean }[]; label: string }) {
  const path = usePathname();
  return <nav aria-label={label} className="flex flex-wrap gap-1">{items.map(item => {
    const active = item.exact ? path === item.href : path.startsWith(item.href);
    return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors", active ? "bg-subtle text-primary" : "text-muted-foreground hover:bg-subtle hover:text-primary")}>{item.label}</Link>;
  })}</nav>;
}
