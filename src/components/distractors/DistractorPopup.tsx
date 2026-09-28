import { type LucideIcon, Megaphone, RefreshCw, ShieldAlert, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { DISTRACTOR_CONTENIDO, DISTRACTOR_DURACION_MS, type DistractorLevel } from '../../config/distractors.config';
import { reproducirSonidoPopup } from './popupSound';

interface DistractorPopupProps {
  popupId: number;
  nivel: DistractorLevel;
  volumenPct: number;
  onClose: () => void;
}

interface EstiloNivel {
  /** 'windows' agrega la mini cabecera tipo Notificación de Windows (fuente + cerrar). */
  chrome: 'simple' | 'windows';
  fuente?: string;
  posicion: string;
  contenedor: string;
  icono: string;
  Icono: LucideIcon;
  pulso?: boolean;
}

const ESTILO_POR_NIVEL: Record<DistractorLevel, EstiloNivel> = {
  nivel1: {
    chrome: 'simple',
    posicion: 'top-24 right-4',
    contenedor: 'border-slate-200 bg-white',
    icono: 'bg-blue-50 text-blue-600',
    Icono: Megaphone,
  },
  nivel2: {
    chrome: 'windows',
    fuente: 'Windows',
    posicion: 'bottom-4 right-4',
    contenedor: 'border-slate-300 bg-white',
    icono: 'bg-sky-50 text-sky-600',
    Icono: RefreshCw,
  },
  nivel3: {
    chrome: 'windows',
    fuente: 'Seguridad de Windows',
    posicion: 'bottom-4 right-4',
    contenedor: 'border-red-200 bg-red-50',
    icono: 'bg-red-100 text-red-600',
    Icono: ShieldAlert,
    pulso: true,
  },
};

/**
 * Pop-up distractor no modal: no bloquea el resto de la pantalla ni roba
 * foco, para que distraiga sin desviar al participante de la bandeja.
 */
export function DistractorPopup({ popupId, nivel, volumenPct, onClose: notificarCierre }: DistractorPopupProps) {
  const contenido = DISTRACTOR_CONTENIDO[nivel];
  const estilo = ESTILO_POR_NIVEL[nivel];
  const Icono = estilo.Icono;

  const cerradoRef = useRef(false);
  const cierreTimeoutRef = useRef<number | null>(null);
  const notificarCierreRef = useRef(notificarCierre);
  notificarCierreRef.current = notificarCierre;

  // La X y el vencimiento comparten un cerrojo síncrono por aparición.
  const onClose = useCallback(() => {
    if (cerradoRef.current) return;
    cerradoRef.current = true;
    if (cierreTimeoutRef.current !== null) window.clearTimeout(cierreTimeoutRef.current);
    cierreTimeoutRef.current = null;
    notificarCierreRef.current();
  }, []);

  useEffect(() => {
    cerradoRef.current = false;
    cierreTimeoutRef.current = window.setTimeout(onClose, DISTRACTOR_DURACION_MS);
    return () => {
      cerradoRef.current = true;
      if (cierreTimeoutRef.current !== null) window.clearTimeout(cierreTimeoutRef.current);
      cierreTimeoutRef.current = null;
    };
  }, [popupId, onClose]);

  useEffect(() => {
    reproducirSonidoPopup(nivel, volumenPct);
  }, [popupId, nivel, volumenPct]);

  const iconoCirculo = (
    <div
      className={`flex h-12 w-12 flex-none items-center justify-center rounded-full ${estilo.icono} ${estilo.pulso ? 'animate-pulse' : ''}`}
    >
      <Icono size={24} />
    </div>
  );

  const cerrarBoton = (
    <button
      type="button"
      onClick={onClose}
      aria-label="Cerrar"
      className="flex-none rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
    >
      <X size={18} />
    </button>
  );

  return (
    <div
      role="alert"
      className={`animate-popup-in fixed ${estilo.posicion} z-40 w-96 overflow-hidden rounded-xl border ${estilo.contenedor} shadow-lg`}
    >
      {estilo.chrome === 'windows' ? (
        <>
          <div className="flex items-center gap-2 px-5 pt-3 text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wide">{estilo.fuente}</span>
            <span className="text-[11px]">· ahora</span>
            <div className="ml-auto">{cerrarBoton}</div>
          </div>
          <div className="flex items-start gap-3 px-5 pb-5 pt-2">
            {iconoCirculo}
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-slate-900">{contenido.titulo}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{contenido.mensaje}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-3 p-5">
          {iconoCirculo}
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-slate-900">{contenido.titulo}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{contenido.mensaje}</p>
          </div>
          {cerrarBoton}
        </div>
      )}
    </div>
  );
}
