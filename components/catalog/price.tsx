import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
export function Price({ amount, className }: { amount: number; className?: string }) {
  return <span className={cn("max-w-full font-semibold tabular-nums [overflow-wrap:anywhere]", className)}>{formatPrice(amount)}</span>;
}
