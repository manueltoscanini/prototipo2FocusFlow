import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import App from '../src/App';

const opciones = ['Tiene adjunto', 'Urgente', 'Interno UCU', 'Hoy'];
function iniciar() {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] });
  vi.setSystemTime(new Date(2026, 8, 30, 12));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Comenzar' }));
  act(() => vi.advanceTimersByTime(100));
}

it('mantiene la configuración por bloques fuera de la vista inicial del participante', () => {
  render(<App />);
  expect(screen.getByText('Configuración por bloque')).not.toBeVisible();
  expect(screen.getByRole('button', { name: 'Comenzar' })).toBeVisible();
});

it('presenta cuatro respuestas directas, sin confirmación ni arrastre', () => {
  iniciar();
  const panel = screen.getByRole('region', { name: 'Clasificá este correo' });
  expect(within(panel).getAllByRole('button').map(b => b.textContent)).toEqual(opciones);
  expect(screen.queryByRole('button', { name: /confirmar/i })).not.toBeInTheDocument();
  expect(document.querySelector('[draggable="true"]')).toBeNull();
  expect(screen.queryByText(/arrastr|soltar aquí/i)).not.toBeInTheDocument();
});

it('evalúa al pulsar, bloquea duplicados, conserva el correo tras error y lo retira tras acierto', () => {
  iniciar();
  const asunto = screen.getByRole('heading', { name: 'Solicitud de licencia médica' });
  const incorrecto = screen.getByRole('button', { name: 'Hoy' });
  fireEvent.click(incorrecto);
  expect(incorrecto).toHaveClass('bg-red-50');
  opciones.forEach(name => expect(screen.getByRole('button', { name })).toBeDisabled());
  fireEvent.click(incorrecto);
  act(() => vi.advanceTimersByTime(1199));
  expect(asunto).toBeInTheDocument();
  expect(incorrecto).toBeDisabled();
  act(() => vi.advanceTimersByTime(1));
  expect(incorrecto).toBeEnabled();
  expect(incorrecto).not.toHaveClass('bg-red-50');
  fireEvent.click(incorrecto);
  act(() => vi.advanceTimersByTime(1200));
  const correcto = screen.getByRole('button', { name: 'Interno UCU' });
  fireEvent.click(correcto);
  expect(correcto).toHaveClass('bg-emerald-50');
  act(() => vi.advanceTimersByTime(499));
  expect(asunto).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1));
  expect(asunto).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(400_000));
  const total = screen.getByText('Intentos totales').parentElement!;
  expect(within(total).getByText('3')).toBeInTheDocument();
  const fallidos = screen.getByText('Intentos fallidos').parentElement!;
  expect(within(fallidos).getByText('2')).toBeInTheDocument();
});

it('cambia silenciosamente tras cinco aciertos y conserva el orden visual en los tres bloques', () => {
  iniciar();
  const reglas = ['Interno UCU', 'Urgente', 'Tiene adjunto'];
  for (let bloque = 0; bloque < 3; bloque++) {
    for (let correo = 0; correo < 5; correo++) {
      if (bloque !== 0 || correo !== 0) {
        const bandeja = screen.getByRole('region', { name: 'Bandeja de entrada' });
        fireEvent.click(within(bandeja).getAllByRole('button')[0]);
      }
      const panel = screen.getByRole('region', { name: 'Clasificá este correo' });
      expect(within(panel).getAllByRole('button').map(b => b.textContent)).toEqual(opciones);
      expect(screen.queryByText(/bloque|regla activa|siguiente regla/i)).toBeNull();
      if (correo === 0 && bloque > 0) {
        const anterior = within(panel).getByRole('button', { name: reglas[bloque - 1] });
        fireEvent.click(anterior);
        expect(anterior).toHaveClass('bg-red-50');
        act(() => vi.advanceTimersByTime(1200));
      }
      const correcto = within(panel).getByRole('button', { name: reglas[bloque] });
      fireEvent.click(correcto);
      expect(correcto).toHaveClass('bg-emerald-50');
      act(() => vi.advanceTimersByTime(500));
      if (correo < 4) act(() => vi.advanceTimersByTime(15000));
    }
    // La pausa sigue siendo de 5 segundos desde el quinto acierto.
    act(() => vi.advanceTimersByTime(4600));
  }
  expect(screen.getByRole('heading', { name: 'Sesión finalizada' })).toBeInTheDocument();
  expect(within(screen.getByText('Intentos totales').parentElement!).getByText('17')).toBeInTheDocument();
});

it('retira solo pendientes incompatibles al cambiar de regla y exporta los descartes e intentos reales', async () => {
  iniciar();
  fireEvent.click(screen.getByRole('button', { name: 'Hoy' }));
  act(() => vi.advanceTimersByTime(1200));
  act(() => vi.advanceTimersByTime(118700));
  act(() => vi.advanceTimersByTime(5000));
  act(() => vi.advanceTimersByTime(100));
  const bandeja = screen.getByRole('region', { name: 'Bandeja de entrada' });
  // b1c1 tenía prioridad baja; b1c2 es urgente y sobrevive.
  expect(within(bandeja).queryByText('Solicitud de licencia médica')).toBeNull();
  fireEvent.click(within(bandeja).getByRole('button', { name: /No puedo acceder a la VPN/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Urgente' }));
  act(() => vi.advanceTimersByTime(500));
  act(() => vi.advanceTimersByTime(119400));
  act(() => vi.advanceTimersByTime(5000));
  act(() => vi.advanceTimersByTime(100));
  expect(within(bandeja).queryByText('El sistema de pagos está caído, no podemos pagar a nadie')).toBeNull();
  act(() => vi.advanceTimersByTime(119900));
  act(() => vi.advanceTimersByTime(5000));
  let blob!: Blob;
  vi.stubGlobal('URL', { createObjectURL: (value: Blob) => { blob = value; return 'blob:session'; }, revokeObjectURL: () => {} });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  fireEvent.click(screen.getByRole('button', { name: 'Descargar CSV' }));
  vi.useRealTimers();
  const csv = await new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(blob);
  });
  const filas = csv.split('\r\n');
  expect(filas).toHaveLength(26); // 2 intentos + 23 descartes + encabezado
  expect(filas.some(f => f.includes('P001,1,Interno UCU,nivel1,b1c1,') && f.includes('criterio_incorrecto'))).toBe(true);
  expect(filas.some(f => f.includes('P001,1,Interno UCU,nivel1,b1c1,') && f.includes('no_clasificado'))).toBe(true);
  expect(filas.some(f => f.includes('P001,2,Urgente,nivel2,b1c2,') && f.includes(',urgente,Urgente,true,'))).toBe(true);
  expect(filas.some(f => f.includes('P001,3,Tiene adjunto,nivel3,b3c8,') && f.includes('no_clasificado'))).toBe(true);
});

it('termina la devolución del intento que coincide con el cierre temporal del bloque', () => {
  iniciar();
  act(() => vi.advanceTimersByTime(119800));
  const boton = screen.getByRole('button', { name: 'Interno UCU' });
  fireEvent.click(boton);
  act(() => vi.advanceTimersByTime(100)); // vence el bloque durante la devolución
  expect(boton).toHaveClass('bg-emerald-50');
  expect(boton).toBeDisabled();
  act(() => vi.advanceTimersByTime(400));
  expect(screen.queryByRole('heading', { name: 'Solicitud de licencia médica' })).toBeNull();
  expect(boton).toBeDisabled(); // pausa original, sin respuestas fuera de bloque
  act(() => vi.advanceTimersByTime(4600));
  const bandeja = screen.getByRole('region', { name: 'Bandeja de entrada' });
  fireEvent.click(within(bandeja).getByRole('button', { name: /No puedo acceder a la VPN/ }));
  const urgente = screen.getByRole('button', { name: 'Urgente' });
  fireEvent.click(urgente);
  expect(urgente).toHaveClass('bg-emerald-50');
});
