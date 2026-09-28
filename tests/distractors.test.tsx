import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useDistractorPopups } from '../src/engine/useDistractorPopups';
import type { DistractorLevel } from '../src/config/distractors.config';
import { DistractorPopup } from '../src/components/distractors/DistractorPopup';

function Escenario({ activo = true }: { activo?: boolean }) {
  const { popup, cerrar } = useDistractorPopups(activo, ['nivel1', 'nivel2']);
  return popup && <DistractorPopup popupId={popup.id} nivel={popup.nivel} volumenPct={0} onClose={cerrar} />;
}

it.each(['nivel1', 'nivel2', 'nivel3'] as const)('conserva una X que cierra %s y cancela el temporizador', nivel => {
  vi.useFakeTimers();
  const cierres: number[] = [];
  render(<DistractorPopup popupId={1} nivel={nivel} volumenPct={0} onClose={() => cierres.push(1)} />);
  expect(screen.getAllByRole('button', { name: 'Cerrar' })).toHaveLength(1);
  act(() => vi.advanceTimersByTime(4000));
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  expect(cierres).toEqual([1]);
  expect(vi.getTimerCount()).toBe(0);
  act(() => vi.advanceTimersByTime(9000));
  expect(cierres).toEqual([1]);
});

it('desaparece tras 9 segundos visible y conserva el intervalo y orden siguientes', () => {
  vi.useFakeTimers();
  render(<Escenario />);
  act(() => vi.advanceTimersByTime(19999));
  expect(screen.queryByRole('alert')).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByText('Publicidad')).toBeVisible();
  act(() => vi.advanceTimersByTime(8999));
  expect(screen.getByRole('alert')).toBeVisible();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole('alert')).toBeNull();
  act(() => vi.advanceTimersByTime(19999));
  expect(screen.queryByRole('alert')).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByText('Actualización de Windows')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  expect(screen.queryByRole('alert')).toBeNull();
});

it.each(['manual', 'automatico'])('entrega un único cierre si vence el reloj y se pulsa X: primero %s', primero => {
  vi.useFakeTimers();
  const cierres: number[] = [];
  render(<DistractorPopup popupId={1} nivel="nivel1" volumenPct={0} onClose={() => cierres.push(1)} />);
  act(() => vi.advanceTimersByTime(8999));
  if (primero === 'manual') fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  act(() => vi.advanceTimersByTime(1));
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  expect(cierres).toEqual([1]);
});

it('cuenta desde el montaje visible y no reinicia los 9 s por cambios de props', () => {
  vi.useFakeTimers();
  const cierres: number[] = [];
  act(() => vi.advanceTimersByTime(60000));
  const { rerender, unmount } = render(<DistractorPopup popupId={1} nivel="nivel1" volumenPct={0} onClose={() => cierres.push(1)} />);
  act(() => vi.advanceTimersByTime(5000));
  rerender(<DistractorPopup popupId={1} nivel="nivel1" volumenPct={0} onClose={() => cierres.push(1)} />);
  act(() => vi.advanceTimersByTime(4000));
  expect(cierres).toEqual([1]);
  rerender(<DistractorPopup popupId={2} nivel="nivel2" volumenPct={0} onClose={() => cierres.push(2)} />);
  act(() => vi.advanceTimersByTime(8999));
  expect(cierres).toEqual([1]);
  act(() => vi.advanceTimersByTime(1));
  expect(cierres).toEqual([1, 2]);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('ignora cierres duplicados en el motor sin adelantar ni duplicar apariciones', () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useDistractorPopups(true, ['nivel1', 'nivel2']));
  act(() => vi.advanceTimersByTime(20000));
  act(() => { result.current.cerrar(); result.current.cerrar(); });
  expect(vi.getTimerCount()).toBe(1);
  act(() => vi.advanceTimersByTime(20000));
  expect(result.current.popup).toEqual({ id: 2, nivel: 'nivel2' });
});

it('cancela el cierre pendiente al terminar la sesión', () => {
  vi.useFakeTimers();
  const { rerender } = render(<Escenario />);
  act(() => vi.advanceTimersByTime(20000));
  expect(screen.getByRole('alert')).toBeVisible();
  rerender(<Escenario activo={false} />);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});

it('espera 20 s, conserva el popup hasta cerrarlo y alterna niveles sin reiniciar el reloj por bloque', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ activo, niveles }) => useDistractorPopups(activo, niveles), {
    initialProps: { activo: true, niveles: ['nivel1', 'nivel2'] as DistractorLevel[] },
  });
  act(() => vi.advanceTimersByTime(19999));
  expect(result.current.popup).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(result.current.popup).toEqual({ id: 1, nivel: 'nivel1' });
  act(() => vi.advanceTimersByTime(60000));
  expect(result.current.popup).toEqual({ id: 1, nivel: 'nivel1' });
  act(() => result.current.cerrar());
  act(() => vi.advanceTimersByTime(20000));
  expect(result.current.popup).toEqual({ id: 2, nivel: 'nivel2' });
  act(() => result.current.cerrar());
  act(() => vi.advanceTimersByTime(10000));
  rerender({ activo: true, niveles: ['nivel3'] });
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.popup).toEqual({ id: 3, nivel: 'nivel3' });
  rerender({ activo: false, niveles: ['nivel3'] });
  expect(result.current.popup).toBeNull();
  act(() => vi.advanceTimersByTime(60000));
  expect(result.current.popup).toBeNull();
});

it('sigue el reloj sin niveles y usa los del bloque vigente al aparecer', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ niveles }) => useDistractorPopups(true, niveles), {
    initialProps: { niveles: [] as DistractorLevel[] },
  });
  act(() => vi.advanceTimersByTime(30000));
  expect(result.current.popup).toBeNull();
  rerender({ niveles: ['nivel2'] });
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.popup?.nivel).toBe('nivel2');
});
