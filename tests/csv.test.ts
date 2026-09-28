import { expect, it, vi } from 'vitest';
import { crearCorpusSesion } from '../src/config/corpus';
import { crearEventoDescartado, crearEventoIntento, contarIntentosPrevios } from '../src/logging/eventLog';
import { descargarCsv, eventosACsv } from '../src/logging/csvExporter';

const email = { ...crearCorpusSesion(new Date(2026, 8, 30, 12))[0][0], asunto: 'Informe, "versión final"\nRevisión' };
const comunes = { participante: 'P001', bloque: 1, criterioVigente: 'interno' as const,
  distractorBloque: ['nivel1', 'nivel2'] as const, email, tLlegadaMs: 100, tPrimeraAperturaMs: 200 };

function eventosEjemplo() {
  const primero = crearEventoIntento({ ...comunes, distractorBloque: [...comunes.distractorBloque],
    tUltimaAperturaMs: 300, tRespuestaMs: 800, botonRespuesta: 'hoy',
    resultado: { correcto: false, tipoError: 'criterio_incorrecto' }, intentoNro: 1 });
  const segundo = crearEventoIntento({ ...comunes, distractorBloque: [...comunes.distractorBloque],
    tUltimaAperturaMs: 300, tRespuestaMs: 2200, botonRespuesta: 'interno',
    resultado: { correcto: true, tipoError: 'ninguno' }, intentoNro: contarIntentosPrevios([primero], email.id) + 1 });
  return [primero, segundo, crearEventoDescartado({ ...comunes, distractorBloque: [], email: { ...email, id: 'pendiente' }, tPrimeraAperturaMs: null })];
}

export function leerBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}

it('preserva 16 columnas, orden, comas, CRLF, intentos, tiempos y distractores', () => {
  const eventos = eventosEjemplo();
  const csv = eventosACsv(eventos);
  expect(csv.split('\r\n')[0]).toBe('participante,bloque,criterio_vigente,distractor_bloque,id_correo,asunto,t_llegada_ms,t_primera_apertura_ms,t_respuesta_ms,boton_id,boton_respuesta,correcto,tiempo_reaccion_ms,intento_nro,tipo_error,timestamp_iso');
  expect(csv).toContain('P001,1,Interno UCU,nivel1+nivel2,b1c1,"Informe, ""versión final""\nRevisión",100,200,800,hoy,Hoy,false,500,1,criterio_incorrecto,');
  expect(csv).toContain(',100,200,2200,interno,Interno UCU,true,1900,2,ninguno,');
  expect(csv).toContain('P001,1,Interno UCU,ninguno,pendiente,');
  expect(csv).toContain(',100,,,,,,,,no_clasificado,');
  expect(eventos[0].timestampIso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});

it('descarga con el nombre original, MIME UTF-8, BOM y revoca la URL', async () => {
  let blob!: Blob;
  let nombre = '';
  const revocar = vi.fn();
  vi.stubGlobal('URL', { createObjectURL: (value: Blob) => { blob = value; return 'blob:csv'; }, revokeObjectURL: revocar });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { nombre = this.download; });
  descargarCsv(eventosEjemplo());
  expect(nombre).toBe('focusflow_sesion.csv');
  expect(blob.type).toBe('text/csv;charset=utf-8;');
  expect(blob.size).toBe(new TextEncoder().encode(eventosACsv(eventosEjemplo())).length + 3);
  expect(await leerBlob(blob)).toContain('boton_respuesta');
  const bytes = await new Promise<Uint8Array>(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  });
  expect([...bytes.slice(0, 3)]).toEqual([239, 187, 191]);
  expect(revocar).toHaveBeenCalledWith('blob:csv');
});
