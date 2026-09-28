import type { DistractorLevel } from '../config/distractors.config';
import type { ClassificationResult } from '../domain/classification';
import type { CriterionId, Email, ResponseId } from '../domain/types';

interface CamposComunes {
  participante: string;
  bloque: number;
  criterioVigente: CriterionId;
  distractorBloque: DistractorLevel[];
  idCorreo: string;
  asunto: string;
  tLlegadaMs: number;
  timestampIso: string;
}

export interface AttemptEvent extends CamposComunes {
  tipo: 'intento';
  tPrimeraAperturaMs: number;
  tRespuestaMs: number;
  botonRespuesta: ResponseId;
  correcto: boolean;
  tiempoReaccionMs: number;
  intentoNro: number;
  tipoError: ClassificationResult['tipoError'];
}

export interface DiscardedEvent extends CamposComunes {
  tipo: 'descartado';
  tPrimeraAperturaMs: number | null;
}

export type SessionEvent = AttemptEvent | DiscardedEvent;

export function contarIntentosPrevios(eventos: SessionEvent[], idCorreo: string): number {
  return eventos.filter((e) => e.tipo === 'intento' && e.idCorreo === idCorreo).length;
}

export function crearEventoIntento(params: {
  participante: string;
  bloque: number;
  criterioVigente: CriterionId;
  distractorBloque: DistractorLevel[];
  email: Email;
  tLlegadaMs: number;
  tPrimeraAperturaMs: number;
  tUltimaAperturaMs: number;
  tRespuestaMs: number;
  botonRespuesta: ResponseId;
  resultado: ClassificationResult;
  intentoNro: number;
}): AttemptEvent {
  return {
    tipo: 'intento',
    participante: params.participante,
    bloque: params.bloque,
    criterioVigente: params.criterioVigente,
    distractorBloque: params.distractorBloque,
    idCorreo: params.email.id,
    asunto: params.email.asunto,
    tLlegadaMs: params.tLlegadaMs,
    tPrimeraAperturaMs: params.tPrimeraAperturaMs,
    tRespuestaMs: params.tRespuestaMs,
    botonRespuesta: params.botonRespuesta,
    correcto: params.resultado.correcto,
    tiempoReaccionMs: params.tRespuestaMs - params.tUltimaAperturaMs,
    intentoNro: params.intentoNro,
    tipoError: params.resultado.tipoError,
    timestampIso: new Date().toISOString(),
  };
}

export function crearEventoDescartado(params: {
  participante: string;
  bloque: number;
  criterioVigente: CriterionId;
  distractorBloque: DistractorLevel[];
  email: Email;
  tLlegadaMs: number;
  tPrimeraAperturaMs: number | null;
}): DiscardedEvent {
  return {
    tipo: 'descartado',
    participante: params.participante,
    bloque: params.bloque,
    criterioVigente: params.criterioVigente,
    distractorBloque: params.distractorBloque,
    idCorreo: params.email.id,
    asunto: params.email.asunto,
    tLlegadaMs: params.tLlegadaMs,
    tPrimeraAperturaMs: params.tPrimeraAperturaMs,
    timestampIso: new Date().toISOString(),
  };
}
