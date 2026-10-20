export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return <header className="space-y-3"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">{eyebrow}</p><h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">{title}</h1><p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p></header>;
}
