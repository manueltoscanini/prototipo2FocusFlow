import { useCallback, useEffect, useRef, useState } from 'react';
import { DISTRACTOR_INTERVALO_MS, type DistractorLevel } from '../config/distractors.config';

export interface DistractorActivo {
  /** Cambia en cada aparición, incluso repitiendo nivel, para poder reiniciar animaciones. */
  id: number;
  nivel: DistractorLevel;
}

export interface UseDistractorPopupsResult {
  popup: DistractorActivo | null;
  cerrar: () => void;
}

/**
 * Late cada `DISTRACTOR_INTERVALO_MS` mientras `activo` sea true. En cada
 * latido, si el bloque vigente en ese momento tiene niveles de distractor
 * asignados (`nivelesActivos`), muestra el que corresponda por turno,
 * alternando entre ellos en el orden dado; si no tiene ninguno asignado, no
 * muestra nada pero sigue latiendo, por si el bloque siguiente sí tiene
 * alguno. El componente cierra por X o al cumplir su exposición máxima,
 * y recién ahí se agenda el próximo latido. No sabe
 * nada de bloques ni de la bandeja: solo administra qué pop-up mostrar, a
 * partir de los niveles vigentes que le pasan desde afuera.
 */
export function useDistractorPopups(
  activo: boolean,
  nivelesActivos: DistractorLevel[],
): UseDistractorPopupsResult {
  const [popup, setPopup] = useState<DistractorActivo | null>(null);

  const idRef = useRef(0);
  const turnoRef = useRef(0);
  const popupActivoRef = useRef<number | null>(null);
  const spawnTimeoutRef = useRef<number | null>(null);
  const activoRef = useRef(activo);
  activoRef.current = activo;
  const nivelesActivosRef = useRef(nivelesActivos);
  nivelesActivosRef.current = nivelesActivos;

  const programarSiguiente = useCallback(() => {
    spawnTimeoutRef.current = window.setTimeout(() => {
      spawnTimeoutRef.current = null;
      const niveles = nivelesActivosRef.current;
      if (niveles.length === 0) {
        programarSiguiente();
        return;
      }
      const nivel = niveles[turnoRef.current % niveles.length];
      turnoRef.current += 1;
      idRef.current += 1;
      popupActivoRef.current = idRef.current;
      setPopup({ id: idRef.current, nivel });
    }, DISTRACTOR_INTERVALO_MS);
  }, []);

  useEffect(() => {
    if (!activo) {
      popupActivoRef.current = null;
      setPopup(null);
      if (spawnTimeoutRef.current !== null) {
        window.clearTimeout(spawnTimeoutRef.current);
        spawnTimeoutRef.current = null;
      }
      return;
    }

    programarSiguiente();

    return () => {
      popupActivoRef.current = null;
      if (spawnTimeoutRef.current !== null) {
        window.clearTimeout(spawnTimeoutRef.current);
        spawnTimeoutRef.current = null;
      }
    };
  }, [activo, programarSiguiente]);

  const cerrar = useCallback(() => {
    if (popupActivoRef.current === null) return;
    popupActivoRef.current = null;
    setPopup(null);
    if (activoRef.current) programarSiguiente();
  }, [programarSiguiente]);

  return { popup, cerrar };
}
