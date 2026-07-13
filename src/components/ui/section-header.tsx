export const SectionHeader = ({
  action,
  description,
  eyebrow,
  id,
  title,
}: {
  action?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  id?: string;
  title: React.ReactNode;
}) => (
  <header
    className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
    data-slot="section-header"
  >
    <div className="space-y-1">
      {eyebrow ? (
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl tracking-tight" id={id}>
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-muted-foreground text-sm">{description}</p>
      ) : null}
    </div>
    {action}
  </header>
);
