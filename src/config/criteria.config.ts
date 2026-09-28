import type { ClassificationOption, ResponseId } from '../domain/types';

/** Orden visual fijo e independiente del orden experimental de los bloques. */
export const OPCIONES: readonly ClassificationOption[] = [
  { id: 'adjunto', etiqueta: 'Tiene adjunto', icono: 'Paperclip' },
  { id: 'urgente', etiqueta: 'Urgente', icono: 'CircleAlert' },
  { id: 'interno', etiqueta: 'Interno UCU', icono: 'Building2' },
  { id: 'hoy', etiqueta: 'Hoy', icono: 'CalendarDays' },
];

export function etiquetaRespuesta(id: ResponseId): string {
  return OPCIONES.find(opcion => opcion.id === id)!.etiqueta;
}
