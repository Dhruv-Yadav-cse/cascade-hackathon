import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  GitBranch,
  Layers3,
  LockKeyhole,
  Network,
  PanelTop,
  Radar,
  ScrollText,
  SlidersHorizontal,
  Target,
  Timer,
} from 'lucide-react';
import {
  getGetAnalysisQueryKey,
  getHealthCheckQueryKey,
  getListAnalysesQueryKey,
  type Analysis,
  useCreateAnalysis,
  useGetAnalysis,
  useHealthCheck,
  useListAnalyses,
  useSimulateScenario,
  useUpdateAnalysis,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ErrorState,
  EmptyState,
  FoundationChecklist,
  NewAnalysisLink,
  PageIntro,
  SkeletonState,
} from '@/components/ready-state';

type QueryStateValue = {
  isLoading?: boolean;
  isPending?: boolean;
  isError: boolean;
  refetch: () => unknown;
  data?: unknown;
};

function QueryState({
  query,
  children,
  empty,
}: {
  query: QueryStateValue;
  children: ReactNode;
  empty: ReactNode;
}) {
  if (query.isLoading || query.isPending) return <SkeletonState />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  if (!query.data || (Array.isArray(query.data) && query.data.length === 0)) {
    return <>{empty}</>;
  }
  return <>{children}</>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

function PageFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">{children}</div>;
}

export function OverviewPage() {
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), retry: false, staleTime: 30_000 } });
  const analyses = useListAnalyses({ query: { queryKey: getListAnalysesQueryKey(), retry: false } });
  const records = analyses.data ?? [];

  return (
    <PageFrame>
      <PageIntro
        eyebrow="Overview / Analysis history"
        title={<>Trace the decision.<br /><span className="text-muted-foreground/45">Before it traces you.</span></>}
        description="CASCADE maps how a decision moves through people, obligations, dependencies, and time. Start with a clear question; leave with a visible signal path."
        action={<NewAnalysisLink />}
      />

      <div className="mb-8 grid gap-4 md:grid-cols-[1.4fr_.9fr]">
        <div className="signal-grid relative min-h-[238px] overflow-hidden rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="relative z-10 max-w-sm">
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">A clear starting point</p>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-.04em]">One workspace for the whole consequence chain.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Keep source context, connected entities, scenarios, paths, and recommendations in one continuous thread.</p>
          </div>
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full border border-primary/25">
            <div className="absolute inset-8 rounded-full border border-primary/30" />
            <div className="absolute inset-16 rounded-full border border-primary/40" />
            <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_8px_hsl(var(--primary)/.12)]" />
          </div>
        </div>
        <FoundationChecklist />
      </div>

      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Your workspaces</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-.035em]">Analysis history</h2>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className={`size-1.5 rounded-full ${health.isError ? 'bg-accent' : 'bg-primary'}`} />
          <span className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{health.isError ? 'API unavailable' : 'Environment ready'}</span>
        </div>
      </div>

      <QueryState
        query={analyses}
        empty={<EmptyState icon={Layers3} title="No analysis workspaces yet" description="Your completed and in-progress decisions will appear here. Start a workspace when you are ready to make the signal path explicit." action={<NewAnalysisLink />} />}
      >
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {records.map((analysis) => (
            <Link key={analysis.id} href={`/analyses/${analysis.id}/analysis`} data-testid={`link-analysis-${analysis.id}`} className="group flex flex-col gap-4 border-b border-border p-5 transition-colors last:border-0 hover:bg-muted/45 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 grid size-9 place-items-center rounded-lg bg-primary/15 text-foreground"><Network className="size-4" /></span>
                <div>
                  <h3 className="font-bold tracking-[-.02em] group-hover:text-accent">{analysis.title}</h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground">{analysis.status} <span className="mx-1.5 text-border">/</span> Updated {new Date(analysis.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-13 sm:pl-0">
                {analysis.riskScore !== null && analysis.riskScore !== undefined && <Badge variant="outline" className="font-mono text-[10px]">{analysis.riskScore} risk</Badge>}
                <ArrowRight className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </div>
            </Link>
          ))}
        </div>
      </QueryState>
    </PageFrame>
  );
}

export function NewAnalysisPage() {
  const createAnalysis = useCreateAnalysis();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState('');
  const [decision, setDecision] = useState('');
  const [objective, setObjective] = useState('');
  const [horizon, setHorizon] = useState('12 months');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createAnalysis.mutate(
      {
        data: {
          title: title.trim(),
          decision: decision.trim(),
          ...(objective.trim() ? { objective: objective.trim() } : {}),
          horizon,
        },
      },
      {
        onSuccess: (analysis) => {
          void queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
          navigate(`/analyses/${analysis.id}/analysis`);
        },
      },
    );
  }

  return (
    <PageFrame>
      <PageIntro eyebrow="New analysis / Decision intake" title={<>Name the decision<br /><span className="text-muted-foreground/45">before mapping the risk.</span></>} description="A focused intake gives every downstream consequence a stable reference point. Save the brief to create a persistent workspace and continue into context." />
      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,.65fr)]">
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/15"><PanelTop className="size-4" /></span>
            <div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Step 01 / 04</p><h2 className="text-lg font-bold">Decision brief</h2></div>
          </div>
          <div className="space-y-6">
            <label className="block"><span className="mb-2 block text-sm font-semibold">Working title</span><input required value={title} onChange={(event) => setTitle(event.target.value)} disabled={createAnalysis.isPending} data-testid="input-analysis-title" placeholder="e.g. Consolidate the regional operations team" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/45 disabled:cursor-not-allowed disabled:opacity-60" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">What decision is being considered?</span><textarea required value={decision} onChange={(event) => setDecision(event.target.value)} disabled={createAnalysis.isPending} data-testid="input-analysis-decision" placeholder="Describe the action, change, or commitment in plain language." className="min-h-28 w-full resize-none rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground/45 disabled:cursor-not-allowed disabled:opacity-60" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">What would a good outcome protect?</span><textarea value={objective} onChange={(event) => setObjective(event.target.value)} disabled={createAnalysis.isPending} data-testid="input-analysis-objective" placeholder="Optional: name the outcome, constraint, or principle you want to preserve." className="min-h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground/45 disabled:cursor-not-allowed disabled:opacity-60" /></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">Planning horizon</span><select value={horizon} onChange={(event) => setHorizon(event.target.value)} disabled={createAnalysis.isPending} data-testid="select-analysis-horizon" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"><option>30 days</option><option>90 days</option><option>12 months</option><option>24 months</option></select></label>
          </div>
          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
            <div>{createAnalysis.isError && <p role="alert" className="max-w-sm text-xs font-medium text-destructive">{getErrorMessage(createAnalysis.error)}</p>}<p className="mt-1 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground/70">{createAnalysis.isPending ? 'Saving workspace…' : 'Saved to your analysis history'}</p></div>
            <Button type="submit" disabled={createAnalysis.isPending} data-testid="button-create-analysis">{createAnalysis.isPending ? 'Saving…' : 'Continue to context'} <ArrowRight className="size-4" /></Button>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-sidebar p-6 text-sidebar-foreground">
            <Radar className="size-6 text-sidebar-primary" strokeWidth={1.5} />
            <h3 className="mt-5 text-lg font-bold tracking-[-.025em]">Start with the decision, not the answer.</h3>
            <p className="mt-2 text-sm leading-6 text-sidebar-foreground/60">CASCADE will use this brief as the anchor for evidence, propagation, scenarios, and recommendations.</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/35 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">What comes next</p>
            <div className="mt-4 space-y-3 text-sm">
              {['Add context & evidence', 'Normalize connected entities', 'Review the consequence graph'].map((item, index) => <div key={item} className="flex items-center gap-3 text-muted-foreground"><span className="font-mono text-[10px] text-accent">0{index + 2}</span>{item}</div>)}
            </div>
          </div>
        </aside>
      </form>
    </PageFrame>
  );
}

function WorkspacePage({
  eyebrow,
  title,
  description,
  icon: Icon,
  query,
  detail,
  emptyTitle,
  emptyDescription,
  action,
}: {
  eyebrow: string; title: ReactNode; description: string; icon: typeof BookOpen;
  query?: QueryStateValue; detail?: ReactNode;
  emptyTitle: string; emptyDescription: string; action?: ReactNode;
}) {
  return (
    <PageFrame>
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4"><Icon className="size-5 text-accent" strokeWidth={1.6} /><p className="mt-5 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Workspace status</p><p className="mt-1 text-sm font-bold">Ready for source data</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><LockKeyhole className="size-5 text-muted-foreground" strokeWidth={1.6} /><p className="mt-5 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Data boundary</p><p className="mt-1 text-sm font-bold">No records assumed</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><span className="font-mono text-xl text-primary">—</span><p className="mt-3 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Current signal</p><p className="mt-1 text-sm font-bold">Awaiting connection</p></div>
      </div>
      {query ? <QueryState query={query} empty={<EmptyState icon={Icon} title={emptyTitle} description={emptyDescription} action={action} />}>{detail}</QueryState> : <EmptyState icon={Icon} title={emptyTitle} description={emptyDescription} action={action} />}
    </PageFrame>
  );
}

function useWorkspaceId() {
  const params = useParams<{ analysisId: string }>();
  return params.analysisId ?? '';
}

function AnalysisBrief({ analysis }: { analysis: Analysis }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Persisted decision brief</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-.04em]">{analysis.title}</h2>
        </div>
        <Badge variant="outline" className="w-fit font-mono text-[10px] uppercase">{analysis.status}</Badge>
      </div>
      <dl className="grid gap-5 pt-6 sm:grid-cols-3">
        <div className="sm:col-span-2"><dt className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Decision</dt><dd className="mt-2 text-sm leading-6">{analysis.decision}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Horizon</dt><dd className="mt-2 text-sm font-semibold">{analysis.horizon}</dd></div>
        <div className="sm:col-span-3"><dt className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Protected outcome</dt><dd className="mt-2 text-sm leading-6 text-muted-foreground">{analysis.objective || 'No outcome has been specified yet.'}</dd></div>
      </dl>
    </div>
  );
}

export function ContextPage() {
  const id = useWorkspaceId();
  const query = useGetAnalysis(id, { query: { queryKey: getGetAnalysisQueryKey(id), enabled: Boolean(id), retry: false } });
  return <WorkspacePage eyebrow="Workspace / Context & evidence" title={<>Build the <span className="text-muted-foreground/45">source layer.</span></>} description="Capture the facts, assumptions, commitments, and evidence that make the decision legible before consequences are inferred." icon={BookOpen} query={query} detail={query.data ? <AnalysisBrief analysis={query.data} /> : null} emptyTitle="Context is ready for evidence" emptyDescription="The context canvas will hold source material and structured facts for this decision." />;
}

export function AnalysisPage() {
  const id = useWorkspaceId();
  const query = useGetAnalysis(id, { query: { queryKey: getGetAnalysisQueryKey(id), enabled: Boolean(id), retry: false } });
  const queryClient = useQueryClient();
  const update = useUpdateAnalysis();
  const [title, setTitle] = useState('');
  const [decision, setDecision] = useState('');
  const [objective, setObjective] = useState('');
  const [horizon, setHorizon] = useState('12 months');

  useEffect(() => {
    if (!query.data) return;
    setTitle(query.data.title);
    setDecision(query.data.decision);
    setObjective(query.data.objective ?? '');
    setHorizon(query.data.horizon);
  }, [query.data]);

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update.mutate(
      {
        analysisId: id,
        data: {
          title: title.trim(),
          decision: decision.trim(),
          objective: objective.trim(),
          horizon,
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getGetAnalysisQueryKey(id) });
          void queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
        },
      },
    );
  }

  const detail = query.data ? (
    <form onSubmit={handleUpdate} className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-7 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Persisted analysis workspace</p><h2 className="mt-2 text-xl font-bold tracking-[-.03em]">{query.data.title}</h2></div>
        <Badge variant="outline" className="w-fit font-mono text-[10px] uppercase">{query.data.status}</Badge>
      </div>
      <div className="space-y-5">
        <label className="block"><span className="mb-2 block text-sm font-semibold">Working title</span><input required value={title} onChange={(event) => setTitle(event.target.value)} disabled={update.isPending} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/45 disabled:cursor-not-allowed disabled:opacity-60" /></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold">Decision</span><textarea required value={decision} onChange={(event) => setDecision(event.target.value)} disabled={update.isPending} className="min-h-28 w-full resize-none rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground/45 disabled:cursor-not-allowed disabled:opacity-60" /></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold">Protected outcome</span><textarea value={objective} onChange={(event) => setObjective(event.target.value)} disabled={update.isPending} className="min-h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-3 text-sm outline-none placeholder:text-muted-foreground/45 disabled:cursor-not-allowed disabled:opacity-60" /></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold">Planning horizon</span><select value={horizon} onChange={(event) => setHorizon(event.target.value)} disabled={update.isPending} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"><option>30 days</option><option>90 days</option><option>12 months</option><option>24 months</option></select></label>
      </div>
      {update.isError && <p role="alert" className="mt-5 text-xs font-medium text-destructive">{getErrorMessage(update.error)}</p>}
      {update.isSuccess && <p className="mt-5 text-xs font-medium text-primary">Workspace saved.</p>}
      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">This workspace is ready for context and evidence in the next milestone.</p><Button type="submit" disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save changes'}</Button></div>
    </form>
  ) : null;

  return <WorkspacePage eyebrow="Workspace / Analysis" title={<>Find where the signal <span className="text-muted-foreground/45">changes shape.</span></>} description="Review the saved decision brief and prepare it for the structured consequence model. This is the center of the CASCADE workspace." icon={BrainCircuit} query={query} detail={detail} emptyTitle="Analysis workspace is staged" emptyDescription="The saved decision brief will appear here when it is available." />;
}

export function GraphPage() {
  return <WorkspacePage eyebrow="Workspace / Graph explorer" title={<>See the <span className="text-muted-foreground/45">connected system.</span></>} description="Explore entities, obligations, dependencies, and events as one navigable consequence graph." icon={GitBranch} emptyTitle="The graph is waiting for structure" emptyDescription="A normalized graph will appear here after context has been analyzed. Nodes and edges are intentionally absent until then." />;
}

export function ScenariosPage() {
  const simulate = useSimulateScenario();
  return <WorkspacePage eyebrow="Workspace / Scenarios" title={<>Compare what <span className="text-muted-foreground/45">could happen.</span></>} description="Place planned, delayed, and adverse conditions side by side without losing the original decision context." icon={BarChart3} emptyTitle="Scenario comparison is ready" emptyDescription="Scenario cards and deterministic run controls will attach here once the analysis model is available." action={<Button type="button" disabled={simulate.isPending} data-testid="button-simulate-scenario"><SlidersHorizontal className="size-4" /> Run a scenario</Button>} />;
}

export function PathsPage() {
  return <WorkspacePage eyebrow="Workspace / Cascade paths" title={<>Rank the <span className="text-muted-foreground/45">propagation paths.</span></>} description="Understand which chains carry the most consequence, where they converge, and which links deserve attention first." icon={GitBranch} emptyTitle="Paths will emerge from a run" emptyDescription="Ranked cascade paths need a completed scenario simulation. The view is reserved and ready for those results." />;
}

export function TimelinePage() {
  return <WorkspacePage eyebrow="Workspace / Timeline" title={<>Put consequences <span className="text-muted-foreground/45">on the clock.</span></>} description="See when a consequence becomes likely, which event precedes it, and how the decision unfolds over its chosen horizon." icon={Timer} emptyTitle="Timeline is waiting for a simulation" emptyDescription="Projected events will be arranged here once a simulation run supplies a horizon and causal sequence." />;
}

export function RecommendationsPage() {
  return <WorkspacePage eyebrow="Workspace / Recommendations" title={<>Turn exposure into <span className="text-muted-foreground/45">next moves.</span></>} description="Translate the highest-signal paths into practical mitigations, watch points, and explicit decisions." icon={Target} emptyTitle="Recommendations follow the analysis" emptyDescription="Risk signals and action recommendations will land here after the graph, scenarios, and paths are available." />;
}

export function ReportPage() {
  return <WorkspacePage eyebrow="Workspace / Final report" title={<>Make the chain <span className="text-muted-foreground/45">shareable.</span></>} description="A concise, evidence-linked report for the people who need to decide, act, or keep watch." icon={ScrollText} emptyTitle="Your report will assemble here" emptyDescription="The final report will combine the decision brief, evidence, paths, timeline, and recommendations into one reviewable artifact." />;
}

export function SettingsPage() {
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), retry: false } });
  return (
    <PageFrame>
      <PageIntro eyebrow="System / Settings" title={<>Tune the <span className="text-muted-foreground/45">workspace.</span></>} description="A small control room for environment status and future workspace preferences." />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 border-b border-border pb-5"><SlidersHorizontal className="size-5 text-accent" /><div><h2 className="font-bold">Workspace preferences</h2><p className="mt-1 text-xs text-muted-foreground">Preference controls arrive with the connected workspace.</p></div></div>
          <div className="divide-y divide-border">
            {['Default analysis horizon', 'Evidence confidence threshold', 'Report sharing defaults'].map((setting) => <div key={setting} className="flex items-center justify-between py-5"><div><p className="text-sm font-semibold">{setting}</p><p className="mt-1 text-xs text-muted-foreground">Not configured</p></div><Badge variant="outline" className="font-mono text-[10px] uppercase">Soon</Badge></div>)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-sidebar p-6 text-sidebar-foreground"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-sidebar-foreground/55">Connection status</p><span className={`size-2 rounded-full ${health.isError ? 'bg-accent' : 'bg-sidebar-primary'}`} /></div><h2 className="mt-6 text-xl font-bold">{health.isError ? 'API not connected' : 'Environment reachable'}</h2><p className="mt-2 text-sm leading-6 text-sidebar-foreground/60">{health.isError ? 'The shell is operating safely without server records.' : 'Health check responded. Workspace routes are ready for data.'}</p><div className="mt-8 flex items-center gap-2 font-mono text-[10px] text-sidebar-foreground/45"><span className="size-1.5 rounded-full bg-sidebar-primary" /> CASCADE foundation / v0.1</div></div>
      </div>
    </PageFrame>
  );
}