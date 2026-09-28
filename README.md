# FocusFlow — Prototipo de clasificación de correos

Prototipo web funcional que reproduce la tarea de clasificación de correos de
una aplicación de escritorio virtual, para validar la experiencia de
interacción y la estructura de la tarea antes de implementarla en Unity.

La tarea combina dos paradigmas: una bandeja de entrada de correo simulada
(bandeja lateral, lector y cuatro botones directos) sobre una estructura de bloques inspirada en
el Berg's Card Sorting Test — el criterio de clasificación cambia sin aviso
cada bloque y el participante debe inferir el cambio a partir del feedback
de error.

Este prototipo corre enteramente en el cliente: no hay backend ni
persistencia en base de datos. Los datos de la sesión se acumulan en memoria
y se exportan a CSV al finalizar.

## Instalación y ejecución

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Esto levanta un servidor de desarrollo (Vite) en `http://localhost:5173`.
Abrí esa URL en el navegador; se puede responder con mouse, pantalla táctil
o teclado (Tab y Enter/Espacio).

Otros comandos disponibles:

```bash
npm run build     # build de producción a dist/
npm run preview   # sirve el build de producción localmente
npm run lint      # linting con oxlint
npm test          # pruebas de dominio, interfaz, sesión, CSV y distractores
```

## Cómo correr la sesión

1. Ingresar el participante. El personal del estudio puede desplegar la
   configuración administrativa para ajustar duración, distractores y volumen.
   Al pulsar **Comenzar** se captura una fecha de referencia única.
2. El primer correo se abre automáticamente. Llegan ocho correos por bloque,
   distribuidos según su duración. Abrir un mensaje y pulsar una respuesta:
   **Tiene adjunto · Urgente · Interno UCU · Hoy**. El orden visual es fijo.
3. Una respuesta verde dura 500 ms y retira el correo; una roja dura 1.200 ms
   y permite reintentar el mismo mensaje. Durante ese tiempo no se puede
   responder ni cambiar el correo seleccionado. Cada respuesta aceptada genera
   un intento, incluidos todos los errores.
4. Las reglas son **Interno UCU → Urgente → Tiene adjunto**, sin anuncios al
   participante. Se conserva el avance por duración o cinco aciertos acumulados,
   la pausa de cinco segundos y el calendario de llegadas. En la pausa no se
   aceptan respuestas. Los pendientes compatibles permanecen; los incompatibles
   se retiran al comenzar el bloque siguiente y se registran como no clasificados
   bajo el bloque anterior.
5. Al terminar, el resumen permite descargar el CSV y comenzar otra sesión.
   Los pendientes finales también se registran como `no_clasificado`.

## Dónde se ajusta cada parámetro de la tarea

Toda la parametrización de la tarea vive en `src/config/` y `src/domain/`.
Ningún componente de `src/components/` contiene valores de temporización,
nombres de categorías ni reglas de validación — cambiar cualquiera de estos
parámetros implica editar únicamente el archivo correspondiente.

| Querés cambiar... | Editá... |
|---|---|
| Duración por defecto de un bloque (minutos) | `duracionBloqueMinDefault` en [`src/config/session.config.ts`](src/config/session.config.ts) — editable por bloque desde la pantalla de inicio en tiempo de ejecución |
| Intervalo entre llegadas de correos | No se configura directamente: se recalcula como `duración del bloque / correosPorBloque`, así siempre respeta los minutos configurados |
| Cantidad de correos por bloque | `correosPorBloque`; mantenerlo consistente con las ocho plantillas de cada bloque |
| Duración de la pausa entre bloques | `pausaEntreBloquesMs` |
| Orden de los criterios a lo largo de los bloques | `ordenCriterios` |
| Identificador de participante por defecto | `participanteDefault` |
| Fechas relativas y formato es-UY | [`src/domain/fechaCorreo.ts`](src/domain/fechaCorreo.ts); referencia capturada al comenzar, calendario en `America/Montevideo` |
| Frecuencia de refresco del reloj interno de la sesión | `TICK_INTERVALO_MS` |
| Rótulos, iconos y orden fijo de respuestas | [`src/config/criteria.config.ts`](src/config/criteria.config.ts) — `OPCIONES` |
| Contenido del corpus (remitente, asunto, cuerpo, prioridad, archivos) | [`src/config/corpus.ts`](src/config/corpus.ts) — `crearCorpusSesion`; materializa fechas relativas al inicio |
| Dominio interno y cálculo de los cuatro atributos | [`src/domain/attributes.ts`](src/domain/attributes.ts) — dominio exacto `ucu.edu.uy`, prioridad alta, lista de archivos y mismo día calendario que la referencia |
| Exposición máxima de cada distractor | `DISTRACTOR_DURACION_MS` en [`src/config/distractors.config.ts`](src/config/distractors.config.ts): 9.000 ms desde el montaje visible; cierre manual con X conservado |
| Regla de qué hace correcta una clasificación | [`src/domain/classification.ts`](src/domain/classification.ts) — `evaluarClasificacion` (no debería necesitar cambios; es la lógica del paradigma) |
| Columnas o formato del CSV exportado | [`src/logging/csvExporter.ts`](src/logging/csvExporter.ts) |

Cada correo debe cumplir exactamente tres atributos y la regla del bloque.
La fábrica del corpus comprueba ambas condiciones. Los adjuntos se deducen
de `adjuntos.length`, no del DOM; la condición interna se deduce del dominio
completo, sin distinguir mayúsculas y sin etiquetas en la interfaz. `Hoy`
compara año, mes y día en Montevideo con la referencia inmutable de la sesión.
El corpus incluye mensajes de ese día y de días anteriores, nunca del futuro.

## Estructura del proyecto

```
src/
  config/            Parametrización de la tarea (temporización, criterios, corpus)
  domain/            Tipos y lógica pura de clasificación (sin UI, sin estado)
  engine/            Hooks de estado: máquina de estados de la sesión y bandeja
  logging/           Registro de eventos en memoria y exportación a CSV
  components/
    layout/          Encabezado y grilla de bandeja (25%) y área principal (75%)
    inbox/           Bandeja de entrada y selección de mensajes
    reader/          Columna de lectura del correo abierto
    classification/  Cuatro respuestas directas con devolución verde/roja
    distractors/     Popups, sonido y cierre manual o automático a los 9 segundos
    screens/         Pantalla de inicio y pantalla de resumen
  App.tsx            Composición: conecta engine + bandeja + registro + UI
```

## Registro de eventos (CSV)

Cada intento de clasificación (correcto o no) genera una fila. Los correos
que quedan pendientes al terminar o se retiran por incompatibilidad con la
siguiente regla generan una fila `no_clasificado`, con campos de respuesta
vacíos. Los timestamps `t_llegada_ms`, `t_primera_apertura_ms` y `t_respuesta_ms`
son relativos al inicio; `tiempo_reaccion_ms` conserva la diferencia entre la
respuesta y la última apertura. `timestamp_iso` es absoluto.

Se mantienen 16 columnas en el mismo orden. Las posiciones 9–11 reemplazan
`t_drop_ms`, `pestana_activa`, `carpeta_destino` por `t_respuesta_ms`, `boton_id`,
`boton_respuesta`. `criterio_vigente` exporta Interno UCU, Urgente o Tiene adjunto.
La respuesta temporal ahora exporta `hoy` en `boton_id` y `Hoy` en
`boton_respuesta`; la clave interna `interno` se conserva.
`tipo_error` usa `ninguno`, `criterio_incorrecto` o `no_clasificado`.
El formato sigue siendo comas, CRLF, escape de comillas, UTF-8 con BOM y
descarga `focusflow_sesion.csv` mediante Blob y URL temporal.

`distractor_bloque` conserva los niveles asignados unidos por `+`, o `ninguno`.
El sistema anterior no registraba eventos individuales de aparición/cierre
de popups, ni filas separadas de cambio de regla, ni un identificador de sesión:
se conserva ese alcance. Cada descarga corresponde a una sesión y los cambios
se identifican por las columnas de bloque y criterio de los eventos.

La X y el vencimiento de 9 segundos comparten un cierre protegido contra
duplicados. Cerrar manualmente cancela el temporizador. El próximo popup se
agenda 20 segundos después del cierre, como antes; se conservan contenido,
sonido, orden, niveles por bloque y funcionamiento durante las pausas.

## Fuera de alcance en esta versión

No incluye persistencia en backend ni archivos binarios para los adjuntos
simulados. Incluye distractores, instrucciones iniciales e identificador
de participante. La interacción física en VR y la validez del protocolo
requieren evaluación del equipo del estudio.
