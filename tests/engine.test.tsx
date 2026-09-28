import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useSessionEngine } from '../src/engine/useSessionEngine';
import type { Email } from '../src/domain/types';
import { atributosCorreo } from '../src/domain/attributes';

it('captura la fecha al comenzar, la conserva tras medianoche y la renueva en otra sesión', () => {
  vi.useFakeTimers({ toFake: ['Date', 'performance', 'setInterval', 'clearInterval'] });
  vi.setSystemTime(new Date('2026-09-27T12:00:00-03:00'));
  const recibidos: Email[] = [];
  const opciones = { duracionesBloqueMs: [120000, 120000, 120000], onEmailArrival: (email: Email) => recibidos.push(email), onBlockEnd: () => {}, onSessionEnd: () => {} };
  const { result, rerender, unmount } = renderHook(() => useSessionEngine(opciones));
  vi.setSystemTime(new Date('2026-09-27T23:59:59-03:00'));
  act(() => result.current.iniciar());
  act(() => vi.advanceTimersByTime(100));
  const referencia = result.current.fechaReferenciaSesion!;
  expect(referencia.toISOString()).toBe('2026-09-28T02:59:59.000Z');
  const fecha = recibidos[0].fechaISO;
  act(() => vi.advanceTimersByTime(2000));
  rerender();
  expect(new Date().toISOString()).toBe('2026-09-28T03:00:01.100Z');
  expect(result.current.fechaReferenciaSesion).toBe(referencia);
  expect(recibidos[0].fechaISO).toBe(fecha);
  expect(atributosCorreo(recibidos[0], referencia).hoy).toBe(true);
  expect(atributosCorreo(recibidos[0], new Date()).hoy).toBe(false);
  unmount();
  const nueva = renderHook(() => useSessionEngine(opciones));
  act(() => nueva.result.current.iniciar());
  expect(nueva.result.current.fechaReferenciaSesion!.toISOString()).toBe('2026-09-28T03:00:01.100Z');
});

it('mantiene llegadas, pausa y orden de reglas al vencer el tiempo', () => {
  vi.useFakeTimers({ toFake: ['Date', 'performance', 'setInterval', 'clearInterval'] });
  const llegadas: { id: string; regla: string; bloque: number }[] = [];
  let finalizado = false;
  const { result } = renderHook(() => useSessionEngine({ duracionesBloqueMs: [8000, 8000, 8000],
    onEmailArrival: (email, ctx) => llegadas.push({ id: email.id, regla: ctx.criterioVigente, bloque: ctx.bloqueNumero }),
    onBlockEnd: () => {}, onSessionEnd: () => { finalizado = true; } }));
  act(() => result.current.iniciar());
  act(() => vi.advanceTimersByTime(8000));
  expect(result.current.fase).toBe('pausa');
  expect(llegadas).toHaveLength(8);
  act(() => vi.advanceTimersByTime(4999));
  expect(llegadas).toHaveLength(8);
  act(() => vi.advanceTimersByTime(26001));
  expect(llegadas.map(e => e.regla)).toEqual([...Array(8).fill('interno'), ...Array(8).fill('urgente'), ...Array(8).fill('adjunto')]);
  expect(llegadas.map(e => e.bloque)).toEqual([...Array(8).fill(1), ...Array(8).fill(2), ...Array(8).fill(3)]);
  expect(finalizado).toBe(true);
});
