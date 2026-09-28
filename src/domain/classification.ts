import type { CriterionId, ResponseId, TipoError } from './types';

export interface ClassificationAttempt {
  criterioVigente: CriterionId;
  botonRespuesta: ResponseId;
}

export interface ClassificationResult {
  correcto: boolean;
  tipoError: TipoError;
}

/**
 * Solo la regla activa es válida, aunque el correo cumpla otros dos atributos.
 */
export function evaluarClasificacion(intento: ClassificationAttempt): ClassificationResult {
  if (intento.botonRespuesta !== intento.criterioVigente) {
    return { correcto: false, tipoError: 'criterio_incorrecto' };
  }

  return { correcto: true, tipoError: 'ninguno' };
}
