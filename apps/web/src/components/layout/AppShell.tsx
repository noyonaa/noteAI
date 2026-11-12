import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { faBars, faXmark } from '../../lib/icons';
import { IconButton } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { NAV_ITEMS } from './nav';
import { ThemeSwitcher } from './ThemeSwitcher';

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="px-5 pb-4 pt-6">
        <span className="text-lg font-extrabold tracking-tight text-text">Nayanote</span>
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-control px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-surface text-text shadow-card'
                      : 'text-muted hover:bg-surface/60 hover:text-text'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-accent-text' : ''}>
                      <Icon icon={item.icon} />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-border-strong/50 px-5 py-4">
        <ThemeSwitcher />
      </div>
    </div>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen border-r border-border lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-bg px-3 py-2 lg:hidden">
        <IconButton icon={faBars} label="Open navigation" onClick={() => setOpen(true)} />
        <span className="text-base font-extrabold tracking-tight">Nayanote</span>
      </header>
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-[#14172a]/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-overlay">
            <div className="absolute right-2 top-3 z-10">
              <IconButton icon={faXmark} label="Close navigation" onClick={() => setOpen(false)} />
            </div>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
