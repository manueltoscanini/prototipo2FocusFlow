import { ZONA_HORARIA_SESION } from './attributes';

export type FechaRelativa = 'hoy' | 'anterior';

const formatoHora = new Intl.DateTimeFormat('es-UY', {
  timeZone: ZONA_HORARIA_SESION, hourCycle: 'h23',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});

/** Fechas relativas al inicio, independientes de la zona horaria del navegador. */
export function crearFechaCorreo(tipo: FechaRelativa, indice: number, referencia: Date): string {
  const partes = formatoHora.formatToParts(referencia);
  const valor = (tipoParte: string) => Number(partes.find(p => p.type === tipoParte)!.value);
  const desdeMedianocheMs = ((valor('hour') * 60 + valor('minute')) * 60 + valor('second')) * 1000
    + referencia.getUTCMilliseconds();
  const antiguedadMs = tipo === 'hoy'
    ? Math.min((indice + 1) * 13 * 60_000, desdeMedianocheMs)
    : (1 + indice % 7) * 86_400_000;
  return new Date(referencia.getTime() - antiguedadMs).toISOString();
}

export function formatearFechaCorreo(fechaISO: string, breve = false): string {
  return new Intl.DateTimeFormat('es-UY', { timeZone: ZONA_HORARIA_SESION, ...(breve
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  ) }).format(new Date(fechaISO));
}
