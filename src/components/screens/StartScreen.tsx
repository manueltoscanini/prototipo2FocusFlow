import { Mail, Megaphone, RefreshCw, ShieldAlert, type LucideIcon } from 'lucide-react';
import { Fragment, type ChangeEvent, type FocusEvent } from 'react';
import {
  DISTRACTOR_CONTENIDO,
  DISTRACTOR_SECUENCIA,
  type DistractorLevel,
} from '../../config/distractors.config';
import { SESSION_CONFIG } from '../../config/session.config';

interface StartScreenProps {
  participanteId: string;
  onCambiarParticipanteId: (id: string) => void;
  duracionesBloqueMin: number[];
  onCambiarDuracion: (indice: number, minutos: number) => void;
  volumenesPopup: Record<DistractorLevel, number>;
  onCambiarVolumen: (nivel: DistractorLevel, porcentaje: number) => void;
  distractoresPorBloque: DistractorLevel[][];
  onCambiarDistractorBloque: (indice: number, nivel: DistractorLevel, activo: boolean) => void;
  onStart: () => void;
}

const DURACION_MIN = 1;
const DURACION_MAX = 30;

const ICONO_POR_NIVEL: Record<DistractorLevel, LucideIcon> = {
  nivel1: Megaphone,
  nivel2: RefreshCw,
  nivel3: ShieldAlert,
};

export function StartScreen({
  participanteId,
  onCambiarParticipanteId,
  duracionesBloqueMin,
  onCambiarDuracion,
  volumenesPopup,
  onCambiarVolumen,
  distractoresPorBloque,
  onCambiarDistractorBloque,
  onStart,
}: StartScreenProps) {
  const handleChangeParticipante = (e: ChangeEvent<HTMLInputElement>) => {
    onCambiarParticipanteId(e.target.value);
  };

  const handleBlurParticipante = (e: FocusEvent<HTMLInputElement>) => {
    const valor = e.target.value.trim();
    onCambiarParticipanteId(valor === '' ? SESSION_CONFIG.participanteDefault : valor);
  };

  const handleChange = (indice: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.valueAsNumber;
    onCambiarDuracion(indice, Number.isNaN(valor) ? 0 : valor);
  };

  const handleBlur = (indice: number) => (e: FocusEvent<HTMLInputElement>) => {
    const valor = Math.min(DURACION_MAX, Math.max(DURACION_MIN, Number(e.target.value) || DURACION_MIN));
    onCambiarDuracion(indice, valor);
  };

  const handleCambiarVolumen = (nivel: DistractorLevel) => (e: ChangeEvent<HTMLInputElement>) => {
    onCambiarVolumen(nivel, e.target.valueAsNumber);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Mail size={28} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">FocusFlow</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Vas a recibir correos en tu bandeja de entrada. Abrilos y presioná una de las cuatro
          opciones debajo del mensaje. Si la respuesta es incorrecta, podés volver a intentarlo.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <label
            htmlFor="participante-id"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Identificador de participante
          </label>
          <input
            id="participante-id"
            type="text"
            value={participanteId}
            onChange={handleChangeParticipante}
            onBlur={handleBlurParticipante}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <details className="mt-4 text-left">
          <summary className="cursor-pointer rounded-lg px-2 py-2 text-sm font-medium text-slate-600 focus-visible:outline-2 focus-visible:outline-blue-600">
            Configuración del estudio (administración)
          </summary>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Configuración por bloque
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Podés marcar varios por bloque (van alternando), o ninguno si no querés distractores
            en ese bloque.
          </p>

          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="grid grid-cols-[2.5rem_auto_1fr] items-center gap-x-3 divide-y divide-slate-100 px-3">
              <span className="py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Bloque
              </span>
              <span className="py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Duración
              </span>
              <span className="py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Distractor
              </span>

              {SESSION_CONFIG.ordenCriterios.map((criterioId, indice) => (
                <Fragment key={criterioId}>
                  <span className="py-2.5 text-base font-medium text-slate-700">{indice + 1}</span>

                  <div className="flex items-center gap-1.5 py-2.5">
                    <input
                      id={`duracion-${criterioId}`}
                      type="number"
                      inputMode="numeric"
                      min={DURACION_MIN}
                      max={DURACION_MAX}
                      step={1}
                      value={duracionesBloqueMin[indice]}
                      onChange={handleChange(indice)}
                      onBlur={handleBlur(indice)}
                      className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-sm text-slate-400">min</span>
                  </div>

                  <div className="flex items-center gap-2 py-2.5">
                    {DISTRACTOR_SECUENCIA.map((nivel) => {
                      const Icono = ICONO_POR_NIVEL[nivel];
                      const activo = distractoresPorBloque[indice].includes(nivel);
                      return (
                        <button
                          key={nivel}
                          type="button"
                          title={DISTRACTOR_CONTENIDO[nivel].titulo}
                          aria-pressed={activo}
                          onClick={() => onCambiarDistractorBloque(indice, nivel, !activo)}
                          className={[
                            'flex h-9 w-9 flex-none items-center justify-center rounded-md border transition-colors',
                            activo
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300 hover:text-slate-400',
                          ].join(' ')}
                        >
                          <Icono size={18} />
                        </button>
                      );
                    })}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Volumen de los pop-ups
          </p>
          <div className="mt-3 space-y-2.5">
            {DISTRACTOR_SECUENCIA.map((nivel) => {
              const Icono = ICONO_POR_NIVEL[nivel];
              return (
                <div key={nivel} className="flex items-center gap-3">
                  <Icono size={18} className="flex-none text-slate-400" />
                  <label
                    htmlFor={`volumen-${nivel}`}
                    className="w-56 flex-none truncate text-base text-slate-600"
                  >
                    {DISTRACTOR_CONTENIDO[nivel].titulo}
                  </label>
                  <input
                    id={`volumen-${nivel}`}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={volumenesPopup[nivel]}
                    onChange={handleCambiarVolumen(nivel)}
                    className="h-1.5 flex-1 accent-blue-600"
                  />
                  <span className="w-9 flex-none text-right text-xs text-slate-400">
                    {volumenesPopup[nivel]}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        </details>

        <button
          type="button"
          onClick={onStart}
          className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}
