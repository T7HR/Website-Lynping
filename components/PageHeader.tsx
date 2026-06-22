export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="page-header mb-7 flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="panel-title mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">{description}</p>}
      </div>
      {actions && <div className="page-header-actions flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
