import type { CriterionId } from '../domain/types';

/**
 * Toda la parametrización temporal y de orden de la sesión vive acá.
 * Cambiar estos valores no requiere tocar ningún componente.
 */
export const SESSION_CONFIG = {
  /** Valor fijo por defecto; el modelo ya soporta alimentarlo desde una pantalla de ingreso futura. */
  participanteDefault: 'P001',

  /**
   * Duración por defecto de cada bloque, en minutos. Es editable por bloque
   * desde la pantalla de inicio (ver StartScreen / App): estos valores son
   * solo el punto de partida que se ofrece antes de arrancar.
   */
  duracionBloqueMinDefault: 2,

  correosPorBloque: 8,
  pausaEntreBloquesMs: 5_000,

  /** Duraciones de devolución conservadas de la versión anterior. */
  errorFeedbackDuracionMs: 1_200,
  aciertoFeedbackDuracionMs: 500,

  /**
   * Aciertos acumulados dentro de un bloque (los errores intermedios no
   * reinician el contador) que hacen avanzar al bloque siguiente antes de
   * que se agote su duración configurada.
   */
  aciertosParaAvanzar: 5,

  /** Orden de criterios a lo largo de los bloques: bloque 1, 2 y 3. */
  ordenCriterios: ['interno', 'urgente', 'adjunto'] as CriterionId[],
} as const;

export const TICK_INTERVALO_MS = 100;
