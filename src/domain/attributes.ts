import type { Email, ResponseId } from './types';

/** Dominio UCU exacto: no incluye subdominios ni sufijos parecidos. */
export const DOMINIOS_INTERNOS: readonly string[] = ['ucu.edu.uy'];
export const ZONA_HORARIA_SESION = 'America/Montevideo';

const formatoCalendario = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA_SESION, year: 'numeric', month: '2-digit', day: '2-digit',
});

export function esInterno(direccion: string): boolean {
  const partes = direccion.trim().toLowerCase().split('@');
  return partes.length === 2 && partes[0].length > 0 && DOMINIOS_INTERNOS.includes(partes[1]);
}

export function esUrgente(email: Email): boolean {
  return email.prioridad === 'alta';
}

export function tieneAdjunto(email: Email): boolean {
  return email.adjuntos.length > 0;
}

export function fechaCalendario(fecha: Date): string {
  return formatoCalendario.format(fecha);
}

export function esHoy(fechaISO: string, referencia: Date): boolean {
  return fechaCalendario(new Date(fechaISO)) === fechaCalendario(referencia);
}

export function atributosCorreo(email: Email, referencia: Date): Record<ResponseId, boolean> {
  return {
    adjunto: tieneAdjunto(email),
    urgente: esUrgente(email),
    interno: esInterno(email.emailRemitente),
    hoy: esHoy(email.fechaISO, referencia),
  };
}
