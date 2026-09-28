import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { crearCorpusSesion } from '../src/config/corpus';
import { EmailReaderColumn } from '../src/components/reader/EmailReaderColumn';
import { InboxItem } from '../src/components/inbox/InboxItem';

it('muestra dirección completa, destinatario, fecha y prioridad; adjuntos naturales sin etiquetas', () => {
  const corpus = crearCorpusSesion(new Date(2026, 8, 30, 12));
  const item = { email: corpus[0][0], arrivalTsMs: 0, firstOpenedTsMs: 0, lastOpenedTsMs: 0 };
  const { rerender } = render(<EmailReaderColumn item={item} />);
  expect(screen.getByText('<maria.gonzalez@ucu.edu.uy>')).toBeVisible();
  expect(screen.getByText('Equipo de proyecto <equipo@ucu.edu.uy>')).toBeVisible();
  expect(screen.getByText('Prioridad baja')).toBeVisible();
  expect(screen.getByText('certificado_medico.pdf')).toBeVisible();
  expect(screen.getByText('156 KB')).toBeVisible();
  expect(document.querySelector('time')).toHaveAttribute('datetime', item.email.fechaISO);
  expect(document.querySelector('time')?.textContent).toContain('2026');
  expect(screen.queryByText(/^(Interno UCU|Externo|Tiene adjunto|Sin adjunto|Con archivo|No contiene archivos)$/)).toBeNull();
  rerender(<EmailReaderColumn item={{ ...item, email: corpus[0][1] }} />);
  expect(screen.getByText('Prioridad alta')).toBeVisible();
  expect(screen.queryByText('certificado_medico.pdf')).toBeNull();
  expect(screen.queryByText(/sin adjunto|no contiene archivos/i)).toBeNull();
});

it('la fila conserva remitente, asunto, fragmento, fecha, prioridad e icono al seleccionarse', () => {
  const email = crearCorpusSesion(new Date(2026, 8, 30, 12))[0][0];
  const item = { email, arrivalTsMs: 0, firstOpenedTsMs: 0, lastOpenedTsMs: 0 };
  render(<InboxItem item={item} seleccionado recienClasificado={false} disabled={false} onAbrir={() => {}} />);
  const fila = screen.getByRole('button');
  expect(fila).toHaveAttribute('aria-current', 'true');
  expect(within(fila).getByText(email.remitente)).toBeVisible();
  expect(within(fila).getByText(email.asunto)).toBeVisible();
  expect(within(fila).getByText(/Quisiera solicitar/)).toBeVisible();
  expect(within(fila).getByLabelText('Prioridad baja')).toBeInTheDocument();
  expect(within(fila).getByLabelText('Archivo adjunto')).toBeInTheDocument();
  expect(fila.querySelector('time')).not.toBeNull();
  expect(fila.textContent).not.toMatch(/Tiene adjunto|Sin adjunto/);
});
