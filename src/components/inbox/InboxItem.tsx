import { CheckCircle2, Flag, Paperclip } from 'lucide-react';
import { tieneAdjunto } from '../../domain/attributes';
import { formatearFechaCorreo } from '../../domain/fechaCorreo';
import type { InboxItemState } from '../../engine/useEmailQueue';

interface InboxItemProps {
  item: InboxItemState;
  seleccionado: boolean;
  recienClasificado: boolean;
  disabled: boolean;
  onAbrir: (id: string) => void;
}

export function InboxItem({ item, seleccionado, recienClasificado, disabled, onAbrir }: InboxItemProps) {
  const abierto = item.firstOpenedTsMs !== null;

  const abrir = () => onAbrir(item.email.id);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={seleccionado ? 'true' : undefined}
      onClick={abrir}
      className={[
        'group relative w-full animate-inbox-in rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-default',
        seleccionado
          ? 'border-blue-300 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300',
        'cursor-pointer',
        recienClasificado ? 'animate-inbox-success' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        {!abierto && <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-blue-500" />}
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-900">{item.email.remitente}</p>
          <p className="mt-1 text-sm font-medium text-slate-800">{item.email.asunto}</p>
        </div>
        {recienClasificado && <CheckCircle2 size={18} className="flex-none text-emerald-500" />}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
        {item.email.cuerpo.replace(/\s+/g, ' ')}
      </p>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <time dateTime={item.email.fechaISO}>{formatearFechaCorreo(item.email.fechaISO, true)}</time>
        <Flag size={16} aria-label={`Prioridad ${item.email.prioridad}`}
          className={`ml-auto ${item.email.prioridad === 'alta' ? 'fill-red-100 text-red-600' : 'text-slate-500'}`} />
        {tieneAdjunto(item.email) && <Paperclip size={16} aria-label="Archivo adjunto" />}
      </div>
      <span
        className={[
          'mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium',
          abierto ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600',
        ].join(' ')}
      >
        {abierto ? 'Sin clasificar' : 'No leído'}
      </span>
    </button>
  );
}
