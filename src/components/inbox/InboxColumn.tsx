import { Inbox } from 'lucide-react';
import type { InboxItemState } from '../../engine/useEmailQueue';
import { InboxItem } from './InboxItem';

interface InboxColumnProps {
  items: InboxItemState[];
  seleccionadoId: string | null;
  recienClasificadoId: string | null;
  disabled: boolean;
  onAbrir: (id: string) => void;
}

export function InboxColumn({
  items,
  seleccionadoId,
  recienClasificadoId,
  disabled,
  onAbrir,
}: InboxColumnProps) {
  return (
    <section aria-label="Bandeja de entrada" className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-none items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Inbox size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-900">Bandeja de entrada</h2>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {items.length}
        </span>
      </header>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {items.length === 0 && (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
            Sin correos pendientes
          </div>
        )}
        {items.map((item) => (
          <InboxItem
            key={item.email.id}
            item={item}
            seleccionado={item.email.id === seleccionadoId}
            recienClasificado={item.email.id === recienClasificadoId}
            disabled={disabled}
            onAbrir={onAbrir}
          />
        ))}
      </div>
    </section>
  );
}
