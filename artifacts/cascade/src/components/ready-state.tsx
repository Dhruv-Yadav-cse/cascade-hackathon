import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Check, CircleDashed, CloudOff, Compass, FilePlus2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-9 flex flex-col justify-between gap-5 border-b border-border/80 pb-8 md:flex-row md:items-end">
      <div>
        <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[.2em] text-accent">{eyebrow}</p>
        <h1 className="max-w-3xl text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[.98] tracking-[-.055em] text-foreground">{title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon = CircleDashed,
  title,
  description,
  action,
}: {
  icon?: typeof CircleDashed;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-border bg-card/60 px-6 py-16 text-center sm:px-12">
      <div className="pointer-events-none absolute inset-x-1/3 top-0 h-20 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto grid size-12 place-items-center rounded-xl border border-border bg-muted text-muted-foreground">
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <h2 className="relative mt-5 text-lg font-bold tracking-[-.025em]">{title}</h2>
      <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <div className="grid size-11 place-items-center rounded-full bg-accent/10 text-accent"><CloudOff className="size-5" /></div>
      <h2 className="mt-4 text-base font-bold">Workspace service is offline</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">This foundation is ready for your API connection. No records have been assumed or fabricated.</p>
      {onRetry && <Button type="button" onClick={onRetry} variant="outline" size="sm" data-testid="button-retry-query" className="mt-5"><RefreshCw className="size-3.5" /> Try again</Button>}
    </div>
  );
}

export function SkeletonState() {
  return (
    <div className="space-y-3" aria-label="Loading workspace">
      <div className="h-28 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function FoundationChecklist() {
  const items = ['Decision intake', 'Context & evidence', 'Propagation model', 'Time horizon'];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Workspace readiness</p>
          <h3 className="mt-1 text-sm font-bold">The signal path starts here</h3>
        </div>
        <Compass className="size-5 text-accent" strokeWidth={1.5} />
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item} className="flex items-center gap-3 text-sm">
            <span className={`grid size-5 place-items-center rounded-full border ${index === 0 ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground/50'}`}>
              {index === 0 ? <Check className="size-3" /> : <span className="size-1 rounded-full bg-current" />}
            </span>
            <span className={index === 0 ? 'font-semibold' : 'text-muted-foreground'}>{item}</span>
            {index === 0 && <span className="ml-auto font-mono text-[10px] uppercase text-primary">Ready</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewAnalysisLink() {
  return (
    <Button asChild data-testid="button-start-analysis">
      <Link href="/analyses/new"><FilePlus2 className="size-4" /> Start an analysis <ArrowRight className="size-3.5 opacity-65" /></Link>
    </Button>
  );
}