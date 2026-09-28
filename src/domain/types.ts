export type CriterionId = 'interno' | 'urgente' | 'adjunto';
export type ResponseId = CriterionId | 'hoy';

export interface EmailAttachment {
  nombre: string;
  tamano: string;
}

export interface Email {
  id: string;
  remitente: string;
  emailRemitente: string;
  asunto: string;
  destinatario: string;
  fechaISO: string;
  prioridad: 'alta' | 'baja';
  cuerpo: string;
  adjuntos: EmailAttachment[];
}

export interface ClassificationOption {
  id: ResponseId;
  etiqueta: string;
  icono: string;
}

/**
 * `ninguno` clasificación correcta.
 * `criterio_incorrecto` botón distinto de la regla vigente del bloque.
 * `no_clasificado` el correo fue descartado al cierre del bloque sin clasificar.
 */
export type TipoError =
  | 'ninguno'
  | 'criterio_incorrecto'
  | 'no_clasificado';
