import { FileImage, FileSpreadsheet, FileText, Flag, Mail } from 'lucide-react';
import { formatearFechaCorreo } from '../../domain/fechaCorreo';
import type { InboxItemState } from '../../engine/useEmailQueue';

interface EmailReaderColumnProps {
  item: InboxItemState | null;
}

export function EmailReaderColumn({ item }: EmailReaderColumnProps) {
  return (
    <section aria-label="Correo abierto" className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-none items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Mail size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-900">Correo abierto</h2>
      </header>

      {!item ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
          <Mail size={32} strokeWidth={1.5} />
          <p className="text-sm">Seleccioná un correo para leerlo</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-5 lg:p-7">
          <h2 className="mb-5 text-2xl font-semibold text-slate-950">{item.email.asunto}</h2>
          <dl className="space-y-2 text-base">
            <div className="flex gap-2">
              <dt className="w-14 flex-none text-slate-400">De:</dt>
              <dd className="min-w-0 break-words text-slate-800">
                {item.email.remitente}{' '}
                <span className="text-slate-600">&lt;{item.email.emailRemitente}&gt;</span>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 flex-none text-slate-500">Para:</dt>
              <dd className="min-w-0 break-words text-slate-800">{item.email.destinatario}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-14 flex-none text-slate-400">Fecha:</dt>
              <dd className="text-slate-800"><time dateTime={item.email.fechaISO}>{formatearFechaCorreo(item.email.fechaISO)}</time></dd>
            </div>
          </dl>
          <span className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${item.email.prioridad === 'alta' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
            <Flag size={18} aria-hidden="true" />Prioridad {item.email.prioridad}
          </span>

          <div className="mt-5 whitespace-pre-line border-t border-slate-100 pt-5 text-base leading-relaxed text-slate-800">
            {item.email.cuerpo}
          </div>

          {item.email.adjuntos.map(archivo => {
            const extension = archivo.nombre.split('.').pop()?.toUpperCase();
            const Icono = extension === 'XLSX' ? FileSpreadsheet : extension === 'PNG' ? FileImage : FileText;
            return (
              <div key={archivo.nombre} className="mt-5 flex max-w-lg items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-none flex-col items-center gap-1 text-blue-600">
                  <Icono size={28} aria-hidden="true" /><span className="text-xs font-bold">{extension}</span>
                </div>
                <div className="min-w-0">
                  <p className="break-words text-base text-slate-900">{archivo.nombre}</p>
                  <p className="mt-1 text-sm text-slate-500">{archivo.tamano}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
