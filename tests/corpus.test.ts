import { describe, expect, it } from 'vitest';
import { crearCorpusSesion } from '../src/config/corpus';
import { atributosCorreo, esInterno, esHoy } from '../src/domain/attributes';
import { crearFechaCorreo, formatearFechaCorreo } from '../src/domain/fechaCorreo';

describe('corpus relativo a una referencia inmutable', () => {
  it.each([new Date(2026, 8, 28, 0, 1), new Date(2026, 8, 30, 12), new Date(2027, 0, 3, 23, 59)])(
    'genera tres atributos reales y la regla del bloque para cada correo en %s', referencia => {
      const bloques = crearCorpusSesion(referencia);
      const reglas = ['interno', 'urgente', 'adjunto'] as const;
      expect(bloques.map(b => b.length)).toEqual([8, 8, 8]);
      expect(new Set(bloques.flat().map(e => e.cuerpo)).size).toBe(24);
      bloques.forEach((correos, bloque) => correos.forEach(email => {
        const atributos = atributosCorreo(email, referencia);
        expect(Object.values(atributos).filter(Boolean), email.id).toHaveLength(3);
        expect(atributos[reglas[bloque]], email.id).toBe(true);
        expect(atributos.adjunto).toBe(email.adjuntos.length > 0);
        expect(atributos.urgente).toBe(email.prioridad === 'alta');
        expect(new Date(email.fechaISO).getTime()).toBeLessThanOrEqual(referencia.getTime());
      }));
      const correos = bloques.flat();
      expect(correos.some(e => esHoy(e.fechaISO, referencia))).toBe(true);
      expect(correos.some(e => !esHoy(e.fechaISO, referencia))).toBe(true);
      const internos = correos.filter(e => esInterno(e.emailRemitente));
      const externos = correos.filter(e => !esInterno(e.emailRemitente));
      expect(internos).toHaveLength(19);
      expect(externos).toHaveLength(5);
      internos.forEach(e => expect(e.emailRemitente).toMatch(/@ucu\.edu\.uy$/i));
      externos.forEach(e => expect(e.emailRemitente).not.toMatch(/@ucu\.edu\.uy$/i));
    },
  );

  it('usa el dominio completo sin aceptar sufijos parecidos', () => {
    expect(esInterno('MARIA@UCU.EDU.UY')).toBe(true);
    expect(esInterno('maria@proveedor.com')).toBe(false);
    expect(esInterno('maria@ucu.edu.uy.ejemplo.org')).toBe(false);
    expect(esInterno('maria@otraucu.edu.uy')).toBe(false);
    expect(esInterno('maria@sub.ucu.edu.uy')).toBe(false);
    expect(esInterno('maria@empresa.com')).toBe(false);
    expect(esInterno('maria@ucu.edu.uy@otro.com')).toBe(false);
  });

  it('Hoy compara el calendario de Montevideo, no UTC ni las últimas 24 horas', () => {
    const referencia = new Date('2027-01-01T03:01:00Z'); // 00:01 en Montevideo
    expect(esHoy('2027-01-01T02:59:00Z', referencia)).toBe(false); // ayer, hace 2 minutos
    expect(esHoy('2027-01-01T03:00:00Z', referencia)).toBe(true);
    expect(esHoy('2027-01-02T02:59:00Z', referencia)).toBe(true); // mismo día calendario
    expect(esHoy('2027-01-02T03:00:00Z', referencia)).toBe(false);
    expect(esHoy('2026-12-31T23:59:00-03:00', new Date('2027-01-01T02:00:00Z'))).toBe(true);
  });

  it('genera y presenta fechas en Montevideo aun cuando UTC ya cambió de año', () => {
    const referencia = new Date('2027-01-01T02:30:00Z');
    expect(crearFechaCorreo('hoy', 0, referencia)).toBe('2027-01-01T02:17:00.000Z');
    expect(crearFechaCorreo('anterior', 0, referencia)).toBe('2026-12-31T02:30:00.000Z');
    expect(formatearFechaCorreo(referencia.toISOString())).toContain('31 de diciembre de 2026');
    expect(formatearFechaCorreo(referencia.toISOString())).toMatch(/11:30 p\.\s*m\./);
    expect(formatearFechaCorreo(referencia.toISOString(), true)).toContain('31');
    const correos = crearCorpusSesion(referencia).flat();
    correos.filter(e => esHoy(e.fechaISO, referencia)).forEach(e =>
      expect(formatearFechaCorreo(e.fechaISO)).toContain('31 de diciembre de 2026'));
  });

  it('al iniciar en la medianoche uruguaya no genera correos de Hoy fechados ayer', () => {
    const referencia = new Date('2026-09-28T03:00:00Z');
    expect(crearFechaCorreo('hoy', 7, referencia)).toBe('2026-09-28T03:00:00.000Z');
    crearCorpusSesion(referencia).flat().forEach(email => {
      expect(Object.values(atributosCorreo(email, referencia)).filter(Boolean)).toHaveLength(3);
    });
  });
});
