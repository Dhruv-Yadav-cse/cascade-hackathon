import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Activity,
  BarChart3,
  ChevronRight,
  FileText,
  GitBranch,
  LayoutDashboard,
  LifeBuoy,
  ListTree,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Sparkles,
  Target,
  Timer,
  X,
} from 'lucide-react';

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const primaryNav: NavItem[] = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/analyses/new', label: 'New analysis', icon: Sparkles },
];

const workspaceNav: NavItem[] = [
  { href: 'context', label: 'Context & evidence', icon: FileText },
  { href: 'analysis', label: 'Analysis workspace', icon: Activity },
  { href: 'graph', label: 'Graph explorer', icon: GitBranch },
  { href: 'scenarios', label: 'Scenarios', icon: BarChart3 },
  { href: 'paths', label: 'Cascade paths', icon: ListTree },
  { href: 'timeline', label: 'Timeline', icon: Timer },
  { href: 'recommendations', label: 'Recommendations', icon: Target },
  { href: 'report', label: 'Final report', icon: FileText },
];

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      data-testid={`link-${item.label.toLowerCase().replaceAll(' ', '-')}`}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_5px_18px_rgba(198,220,72,.14)]'
          : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      }`}
    >
      <Icon className="size-[17px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
      <span className="truncate">{item.label}</span>
      {active && <ChevronRight className="ml-auto size-3.5 opacity-65" />}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const analysisMatch = location.match(/^\/analyses\/([^/]+)/);
  const analysisId = analysisMatch?.[1];
  const isWorkspaceRoute = Boolean(analysisId && analysisId !== 'new');
  const workspacePath = isWorkspaceRoute ? `/analyses/${analysisId}` : '';

  const navContent = (
    <>
      <div className="flex h-[72px] items-center px-5">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          data-testid="link-brand"
          className="group flex items-center gap-3"
        >
          <span className="relative grid size-8 place-items-center rounded-[10px] bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="absolute h-4 w-px rotate-45 bg-sidebar-primary-foreground/80" />
            <span className="absolute h-4 w-px -rotate-45 bg-sidebar-primary-foreground/80" />
            <span className="absolute size-1.5 rounded-full bg-sidebar-primary-foreground" />
          </span>
          <span className="text-[18px] font-extrabold tracking-[-0.04em] text-sidebar-foreground">CASCADE</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          data-testid="button-close-navigation"
          className="ml-auto grid size-8 place-items-center rounded-md text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-4">
        <p className="mb-2 px-3 pt-3 font-mono text-[10px] font-medium uppercase tracking-[.18em] text-sidebar-foreground/35">Command center</p>
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <NavLink key={item.href} item={item} active={location === item.href} onNavigate={() => setMobileOpen(false)} />
          ))}
        </div>

        {isWorkspaceRoute && (
          <>
            <div className="my-5 h-px bg-sidebar-border" />
            <div className="mb-2 flex items-center justify-between px-3">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[.18em] text-sidebar-foreground/35">Workspace</p>
              <span className="font-mono text-[10px] text-sidebar-foreground/30">01</span>
            </div>
            <div className="space-y-1">
              {workspaceNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={{ ...item, href: `${workspacePath}/${item.href}` }}
                  active={location === `${workspacePath}/${item.href}`}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          data-testid="link-settings"
          className={`mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors ${
            location === '/settings'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
        >
          <Settings2 className="size-[17px]" strokeWidth={1.8} />
          Settings
        </Link>
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/55 px-3 py-2.5">
          <span className="grid size-7 place-items-center rounded-full bg-[#d5e977] font-mono text-[10px] font-medium text-[#202a35]">AR</span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-sidebar-foreground">Avery Rowan</p>
            <p className="truncate font-mono text-[10px] text-sidebar-foreground/40">Principal analyst</p>
          </div>
          <button type="button" aria-label="Open help" data-testid="button-open-help" className="ml-auto text-sidebar-foreground/35 hover:text-sidebar-foreground">
            <LifeBuoy className="size-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="noise-surface min-h-[100dvh] bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-sidebar transition-[width] duration-200 lg:flex ${collapsed ? 'w-[76px]' : 'w-[252px]'}`}>
        {!collapsed && navContent}
        {collapsed && (
          <div className="flex h-full flex-col items-center py-5">
            <Link href="/" data-testid="link-brand-collapsed" className="grid size-8 place-items-center rounded-[10px] bg-sidebar-primary text-sidebar-primary-foreground">
              <span className="relative h-4 w-4"><span className="absolute left-1/2 h-4 w-px rotate-45 bg-current" /><span className="absolute left-1/2 h-4 w-px -rotate-45 bg-current" /><span className="absolute left-[6px] top-[6px] size-1.5 rounded-full bg-current" /></span>
            </Link>
            <button type="button" onClick={() => setCollapsed(false)} aria-label="Expand navigation" data-testid="button-expand-navigation" className="mt-auto grid size-9 place-items-center rounded-md text-sidebar-foreground/45 hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <PanelLeftOpen className="size-4" />
            </button>
          </div>
        )}
        {!collapsed && (
          <button type="button" onClick={() => setCollapsed(true)} aria-label="Collapse navigation" data-testid="button-collapse-navigation" className="absolute -right-3 top-[76px] grid size-6 place-items-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/55 shadow-sm transition-colors hover:text-sidebar-foreground">
            <PanelLeftClose className="size-3.5" />
          </button>
        )}
      </aside>

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-border/75 bg-background/90 px-4 backdrop-blur-md sm:px-8 lg:px-10">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation" className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden">
            <Menu className="size-5" />
          </button>
          <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground/70 lg:flex">
            <span className="size-1.5 rounded-full bg-primary" />
            Signal environment <span className="text-muted-foreground/40">/</span> Local workspace
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-[10px] text-muted-foreground/70 sm:inline">Last sync — not connected</span>
            <span className="size-2 rounded-full border border-muted-foreground/45" title="Not connected" />
          </div>
        </header>
        <main className="min-h-[calc(100dvh-64px)]">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" data-testid="button-close-navigation-overlay" className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" />
          <aside className="relative flex w-[min(86vw,320px)] flex-col bg-sidebar shadow-2xl">{navContent}</aside>
        </div>
      )}
    </div>
  );
}

export { workspaceNav };