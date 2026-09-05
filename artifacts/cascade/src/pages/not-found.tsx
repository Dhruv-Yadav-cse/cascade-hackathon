import { Link } from 'wouter';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/15 text-foreground"><Compass className="size-5" /></div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-accent">Signal lost / 404</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-[-.04em]">This path is not mapped.</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">The workspace route you requested does not exist yet.</p>
        <Button asChild variant="outline" className="mt-6" data-testid="button-return-overview">
          <Link href="/"><ArrowLeft className="size-4" /> Return to overview</Link>
        </Button>
      </div>
    </div>
  );
}
