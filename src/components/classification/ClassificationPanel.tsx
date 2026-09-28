import { Building2, CalendarDays, CircleAlert, Paperclip } from 'lucide-react';
import { OPCIONES } from '../../config/criteria.config';
import type { ResponseId } from '../../domain/types';

const ICONOS = { Building2, CalendarDays, CircleAlert, Paperclip };
export interface FeedbackRespuesta { boton: ResponseId; correcto: boolean }

interface ClassificationPanelProps {
  disabled: boolean;
  feedback: FeedbackRespuesta | null;
  onResponder: (id: ResponseId) => void;
}

export function ClassificationPanel({ disabled, feedback, onResponder }: ClassificationPanelProps) {
  return (
    <section aria-labelledby="classification-title" className="flex-none rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 id="classification-title" className="text-xl font-semibold text-slate-950">Clasificá este correo</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">Presioná una opción para responder.</p>
      <div className="classification-options">
        {OPCIONES.map(opcion => {
          const Icono = ICONOS[opcion.icono as keyof typeof ICONOS];
          const resultado = feedback?.boton === opcion.id ? feedback : null;
          return (
            <button key={opcion.id} type="button" disabled={disabled} onClick={() => onResponder(opcion.id)}
              className={[
                'flex min-h-28 flex-col items-center justify-center gap-3 rounded-xl border-2 px-3 py-4 text-lg font-semibold transition-colors focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-default',
                resultado ? resultado.correcto ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-red-500 bg-red-50 text-red-800'
                  : 'border-slate-200 bg-white text-slate-900 enabled:hover:border-blue-400 enabled:hover:bg-blue-50 disabled:text-slate-400',
              ].join(' ')}>
              <Icono size={32} aria-hidden="true" className={resultado ? '' : 'text-blue-600'} />
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>
      <span role="status" className="sr-only">{feedback ? feedback.correcto ? 'Correcto' : 'Incorrecto' : ''}</span>
    </section>
  );
}
