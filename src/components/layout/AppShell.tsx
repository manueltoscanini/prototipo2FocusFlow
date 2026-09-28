import { Home, Mail } from 'lucide-react';
import type { ReactNode } from 'react';

interface AppShellProps {
  onVolverAlInicio: () => void;
  children: ReactNode;
}

export function AppShell({ onVolverAlInicio, children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex flex-none items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Mail size={20} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">FocusFlow</h1>
        </div>

        <button
          type="button"
          onClick={onVolverAlInicio}
          title="Volver al inicio (reinicia la sesión actual)"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <Home size={16} />
          Volver al inicio
        </button>
      </header>

      <main className="task-layout grid min-h-0 flex-1 gap-4 p-4">{children}</main>
    </div>
  );
}
