import type { SessionEvent } from './eventLog';
import { etiquetaRespuesta } from '../config/criteria.config';

const COLUMNAS = [
  'participante',
  'bloque',
  'criterio_vigente',
  'distractor_bloque',
  'id_correo',
  'asunto',
  't_llegada_ms',
  't_primera_apertura_ms',
  't_respuesta_ms',
  'boton_id',
  'boton_respuesta',
  'correcto',
  'tiempo_reaccion_ms',
  'intento_nro',
  'tipo_error',
  'timestamp_iso',
] as const;

function escaparCeldaCsv(valor: string | number | boolean | null): string {
  if (valor === null) return '';
  const texto = String(valor);
  if (/[",\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/** Uno o varios niveles asignados se listan unidos por "+"; ninguno asignado se escribe literal. */
function formatearDistractorBloque(niveles: readonly string[]): string {
  return niveles.length > 0 ? niveles.join('+') : 'ninguno';
}

function eventoAFila(evento: SessionEvent): (string | number | boolean | null)[] {
  const comunes = [
    evento.participante,
    evento.bloque,
    etiquetaRespuesta(evento.criterioVigente),
    formatearDistractorBloque(evento.distractorBloque),
    evento.idCorreo,
    evento.asunto,
    evento.tLlegadaMs,
  ];

  if (evento.tipo === 'descartado') {
    return [
      ...comunes,
      evento.tPrimeraAperturaMs,
      null,
      null,
      null,
      null,
      null,
      null,
      'no_clasificado',
      evento.timestampIso,
    ];
  }

  return [
    ...comunes,
    evento.tPrimeraAperturaMs,
    evento.tRespuestaMs,
    evento.botonRespuesta,
    etiquetaRespuesta(evento.botonRespuesta),
    evento.correcto,
    evento.tiempoReaccionMs,
    evento.intentoNro,
    evento.tipoError,
    evento.timestampIso,
  ];
}

export function eventosACsv(eventos: SessionEvent[]): string {
  const filas = [COLUMNAS.join(',')];
  for (const evento of eventos) {
    filas.push(eventoAFila(evento).map(escaparCeldaCsv).join(','));
  }
  return filas.join('\r\n');
}

export function descargarCsv(eventos: SessionEvent[], nombreArchivo = 'focusflow_sesion.csv'): void {
  const csv = eventosACsv(eventos);
  const BOM = String.fromCharCode(0xfeff);
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
