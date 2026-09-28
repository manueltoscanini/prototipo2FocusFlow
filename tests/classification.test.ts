import { describe, expect, it } from 'vitest';
import { SESSION_CONFIG } from '../src/config/session.config';
import { evaluarClasificacion } from '../src/domain/classification';

describe('reglas de clasificación directa', () => {
  it('mantiene Interno UCU → Urgente → Tiene adjunto', () => {
    expect(SESSION_CONFIG.ordenCriterios).toEqual(['interno', 'urgente', 'adjunto']);
  });

  it('acepta solamente el identificador de la regla activa', () => {
    for (const regla of ['interno', 'urgente', 'adjunto'] as const) {
      for (const boton of ['adjunto', 'urgente', 'interno', 'hoy'] as const) {
        expect(evaluarClasificacion({ criterioVigente: regla, botonRespuesta: boton }))
          .toEqual({ correcto: regla === boton, tipoError: regla === boton ? 'ninguno' : 'criterio_incorrecto' });
      }
    }
  });
});
