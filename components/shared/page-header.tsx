export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return <header className="space-y-2">{eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}<h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1><p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p></header>;
}
