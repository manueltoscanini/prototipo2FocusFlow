import { crearFechaCorreo, type FechaRelativa } from '../domain/fechaCorreo';
import { atributosCorreo } from '../domain/attributes';
import type { Email } from '../domain/types';
import { SESSION_CONFIG } from './session.config';

/** 24 mensajes distintos. Las fechas se materializan solo al iniciar cada sesión. */
type PlantillaCorreo = Omit<Email, 'fechaISO' | 'destinatario'> & { fechaRelativa: FechaRelativa };

const CORPUS_BLOQUE_1: PlantillaCorreo[] = [
  {
    id: 'b1c1',
    remitente: 'María González',
    emailRemitente: 'maria.gonzalez@ucu.edu.uy',
    asunto: 'Solicitud de licencia médica',
    fechaRelativa: 'hoy',
    prioridad: 'baja',
    cuerpo:
      'Hola,\n\nQuisiera solicitar dos días de licencia médica para realizarme los estudios indicados por mi médico. Les envío el certificado para que puedan revisar la solicitud cuando tengan disponibilidad.\n\nQuedo a disposición por cualquier información adicional.\n\nSaludos,\nMaría González',
    adjuntos: [{ nombre: 'certificado_medico.pdf', tamano: '156 KB' }],
  },
  {
    id: 'b1c2',
    remitente: 'Diego Aramburu',
    emailRemitente: 'diego.aramburu@ucu.edu.uy',
    asunto: 'No puedo acceder a la VPN',
    fechaRelativa: 'hoy',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nDesde esta mañana no logro conectarme a la VPN y necesito entrar al servidor de proyectos para una entrega de hoy al mediodía. Ya probé reiniciar el cliente y cambiar de red, pero sigue sin funcionar.\n\n¿Me pueden ayudar lo antes posible? Se me complica bastante si no lo resuelvo en la próxima hora.\n\nGracias,\nDiego Aramburu',
    adjuntos: [],
  },
  {
    id: 'b1c3',
    remitente: 'Lucía Ferreyra',
    emailRemitente: 'lucia.ferreyra@ucu.edu.uy',
    asunto: 'Pago a proveedor vence hoy, riesgo de corte',
    fechaRelativa: 'anterior',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nEl proveedor de energía nos avisó que si no acreditamos el pago pendiente antes de las 18 h de hoy, procede a cortar el suministro del campus. Necesito que alguien autorice la transferencia con urgencia, ya está todo cargado en el sistema.\n\nCualquier demora nos deja sin actividad mañana. Quedo atenta.\n\nSaludos,\nLucía Ferreyra',
    adjuntos: [{ nombre: 'aviso_suministro.pdf', tamano: '184 KB' }],
  },
  {
    id: 'b1c4',
    remitente: 'Martín Sosa',
    emailRemitente: 'martin.sosa@ucu.edu.uy',
    asunto: '¿Sumamos un pedido de café para la oficina?',
    fechaRelativa: 'hoy',
    prioridad: 'baja',
    cuerpo:
      'Hola,\n\nEstoy preparando un pedido de café e insumos para la cocina. Les comparto la planilla con las cantidades estimadas para que puedan agregar sugerencias.\n\nTenemos margen para revisar las opciones antes de enviar el pedido al proveedor.\n\nSaludos,\nMartín',
    adjuntos: [{ nombre: 'pedido_cocina.xlsx', tamano: '42 KB' }],
  },
  {
    id: 'b1c5',
    remitente: 'Valentina Ríos',
    emailRemitente: 'valentina.rios@ucu.edu.uy',
    asunto: 'Factura 0345 pendiente de tu aprobación',
    fechaRelativa: 'anterior',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nLa factura 0345 sigue pendiente de aprobación y el proveedor suspendió los nuevos despachos. Les envío el PDF para que puedan revisarlo y autorizar el pago cuanto antes.\n\nNecesitamos liberar la entrega de insumos para retomar las actividades.\n\nGracias,\nValentina Ríos',
    adjuntos: [{ nombre: 'factura_0345.pdf', tamano: '212 KB' }],
  },
  {
    id: 'b1c6',
    remitente: 'Paula Méndez',
    emailRemitente: 'paula.mendez@ucu.edu.uy',
    asunto: 'Renovación de protección de los equipos',
    fechaRelativa: 'hoy',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nEl servicio de protección de las notebooks vence al cierre del día. Necesito que autoricen la renovación en el portal de compras para evitar que los equipos queden sin cobertura.\n\nEl número de solicitud es 2048 y ya está validado por Sistemas.\n\nGracias,\nPaula',
    adjuntos: [],
  },
  {
    id: 'b1c7',
    remitente: 'Nicolás Pereyra',
    emailRemitente: 'nicolas.pereyra@ucu.edu.uy',
    asunto: 'Colecta para el regalo de Marisa',
    fechaRelativa: 'hoy',
    prioridad: 'baja',
    cuerpo:
      'Hola,\n\nOrganizamos una colecta para el regalo de despedida de Marisa, que se jubila a fin de mes. Si querés sumarte, avisame y te paso el alias.\n\nLa idea es juntar todo antes de su último día e ir a comer algo entre todos.\n\nUn abrazo,\nNicolás',
    adjuntos: [{ nombre: 'colecta_despedida.xlsx', tamano: '28 KB' }],
  },
  {
    id: 'b1c8',
    remitente: 'Pablo Silva',
    emailRemitente: 'pablo.silva@ucu.edu.uy',
    asunto: 'Reposición de insumos para impresión',
    fechaRelativa: 'anterior',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nSe agotó el tóner de la impresora de despacho y no podemos emitir las etiquetas de los envíos. Les comparto la solicitud de reposición con los modelos compatibles.\n\nNecesitamos autorizar la compra cuanto antes para liberar los pedidos que están esperando.\n\nSaludos,\nPablo',
    adjuntos: [{ nombre: 'reposicion_insumos.pdf', tamano: '116 KB' }],
  },
];

const CORPUS_BLOQUE_2: PlantillaCorreo[] = [
  {
    id: 'b2c1',
    remitente: 'Camila Duarte',
    emailRemitente: 'camila.duarte@ucu.edu.uy',
    asunto: 'El sistema de pagos está caído, no podemos pagar a nadie',
    fechaRelativa: 'hoy',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nEl sistema de pagos se cayó hace media hora y tenemos tres transferencias a proveedores que vencen hoy. Ya avisé a soporte pero necesito que alguien lo escale porque si no pagamos antes de las 16 h perdemos las condiciones acordadas.\n\n¿Podés ayudarme a destrabar esto?\n\nGracias,\nCamila Duarte',
    adjuntos: [],
  },
  {
    id: 'b2c2',
    remitente: 'Federico Lombardi',
    emailRemitente: 'federico.lombardi@ucu.edu.uy',
    asunto: 'Tercer aviso: seguimos sin acceso al sistema de tickets',
    fechaRelativa: 'anterior',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nEsta es la tercera vez que escribo por el mismo problema: todo el equipo de atención al cliente sigue sin poder entrar al sistema de tickets. Les envío el registro de incidencias del servicio.\n\nNecesitamos una solución inmediata, esto ya está afectando el seguimiento de reclamos.\n\nSaludos,\nFederico Lombardi',
    adjuntos: [{ nombre: 'incidencias_tickets.pdf', tamano: '220 KB' }],
  },
  {
    id: 'b2c3',
    remitente: 'Sofía Bianchi',
    emailRemitente: 'sofia.bianchi@formacionrrhh-online.com',
    asunto: 'Falta validar las inscripciones del equipo',
    fechaRelativa: 'hoy',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nNecesitamos validar las inscripciones del equipo para habilitar el acceso a la capacitación. Les envío el formulario con los datos pendientes.\n\nEl aula se abre en unas horas; por favor devuélvanlo completo cuanto antes para evitar que alguien quede sin acceso.\n\nGracias,\nSofía Bianchi',
    adjuntos: [{ nombre: 'formulario_autoevaluacion.pdf', tamano: '98 KB' }],
  },
  {
    id: 'b2c4',
    remitente: 'Tomás Acosta',
    emailRemitente: 'tomas.acosta@ucu.edu.uy',
    asunto: 'Seguimiento: orden de compra de equipamiento sin confirmar',
    fechaRelativa: 'anterior',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nEl proveedor no confirmó la orden de compra 0128 y el equipo necesita las notebooks para comenzar la capacitación. Les envío la orden pendiente.\n\nPor favor contacten al proveedor de inmediato: sin esa confirmación perdemos la reserva del equipamiento.\n\nSaludos,\nTomás Acosta',
    adjuntos: [{ nombre: 'orden_compra_0128.pdf', tamano: '145 KB' }],
  },
  {
    id: 'b2c5',
    remitente: 'Julieta Medina',
    emailRemitente: 'julieta.medina@ucu.edu.uy',
    asunto: '¿Me prestás un cargador tipo C?',
    fechaRelativa: 'hoy',
    prioridad: 'alta',
    cuerpo:
      'Holaa, disculpá la molestia. Se me quedó el cargador de la notebook en casa y tengo una reunión en veinte minutos. ¿Tenés uno tipo C que me puedas prestar hasta la tarde?\n\nTe lo devuelvo antes de irme, prometido.\n\nGracias!\nJulieta',
    adjuntos: [],
  },
  {
    id: 'b2c6',
    remitente: 'Agustín Rossi',
    emailRemitente: 'agustin.rossi@bancorioplatense.com.ar',
    asunto: 'Transferencia retenida: documentación pendiente',
    fechaRelativa: 'hoy',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nLa transferencia a su proveedor quedó retenida por un dato incompleto. Les envío el detalle de la operación para que validen la cuenta de destino.\n\nNecesitamos su respuesta antes del cierre bancario para evitar que se cancele el pago.\n\nSaludos,\nAgustín Rossi',
    adjuntos: [{ nombre: 'detalle_transferencia.pdf', tamano: '165 KB' }],
  },
  {
    id: 'b2c7',
    remitente: 'Elena Suárez',
    emailRemitente: 'elena.suarez@ucu.edu.uy',
    asunto: 'Confirmación de capacitación obligatoria',
    fechaRelativa: 'anterior',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nNecesitamos confirmar de inmediato la participación del equipo en la capacitación de seguridad. Les envío el programa y los requisitos del curso.\n\nSin esta confirmación no podremos habilitar los accesos al campus para el próximo turno.\n\nGracias,\nElena',
    adjuntos: [{ nombre: 'brochure_curso.pdf', tamano: '2,4 MB' }],
  },
  {
    id: 'b2c8',
    remitente: 'Oficina Total',
    emailRemitente: 'promos@oficinatotal.com.ar',
    asunto: 'Entrega detenida por diferencia en el pedido',
    fechaRelativa: 'hoy',
    prioridad: 'alta',
    cuerpo:
      'Estimados,\n\nEl camión está esperando en el depósito porque el pedido no coincide con el remito. Les enviamos el documento marcado con las diferencias.\n\nPor favor confirmen las cantidades cuanto antes para evitar que el transporte regrese con la mercadería.\n\nSaludos,\nOficina Total',
    adjuntos: [{ nombre: 'remito_pendiente.pdf', tamano: '130 KB' }],
  },
];

const CORPUS_BLOQUE_3: PlantillaCorreo[] = [
  {
    id: 'b3c1',
    remitente: 'Carolina Funes',
    emailRemitente: 'carolina.funes@ucu.edu.uy',
    asunto: 'Propuesta para el encuentro del equipo',
    fechaRelativa: 'hoy',
    prioridad: 'baja',
    cuerpo:
      'Hola,\n\nLes comparto la propuesta para el próximo encuentro del equipo, con las opciones de lugar y menú. Pueden revisarla cuando tengan un momento y acercarme sus sugerencias.\n\nLa idea es elegir una alternativa que nos quede cómoda a todos.\n\nSaludos,\nCarolina',
    adjuntos: [{ nombre: 'encuentro_equipo.pdf', tamano: '310 KB' }],
  },
  {
    id: 'b3c2',
    remitente: 'Ezequiel Paz',
    emailRemitente: 'ezequiel.paz@ucu.edu.uy',
    asunto: 'Necesito resolver un tema de obra social antes del jueves',
    fechaRelativa: 'anterior',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nTengo un turno médico el jueves y en la obra social me dicen que figuro sin cobertura activa por un tema administrativo de la universidad. Ya llamé dos veces y no consigo que lo resuelvan del otro lado.\n\n¿Podrían gestionarlo con urgencia? Si no se resuelve antes pierdo el turno.\n\nGracias,\nEzequiel Paz',
    adjuntos: [{ nombre: 'constancia_cobertura.pdf', tamano: '145 KB' }],
  },
  {
    id: 'b3c3',
    remitente: 'Rocío Ibáñez',
    emailRemitente: 'rocio.ibanez@ucu.edu.uy',
    asunto: 'Presupuesto propuesto para el próximo trimestre',
    fechaRelativa: 'hoy',
    prioridad: 'baja',
    cuerpo:
      'Hola,\n\nLes comparto la planilla con el presupuesto propuesto para el próximo trimestre, desglosado por área. Es un primer borrador para revisar con tiempo antes de la reunión con Dirección.\n\nCualquier ajuste que quieran hacer, lo podemos conversar durante la revisión.\n\nSaludos,\nRocío Ibáñez',
    adjuntos: [{ nombre: 'presupuesto_proximo_trimestre.xlsx', tamano: '340 KB' }],
  },
  {
    id: 'b3c4',
    remitente: 'Banco Rioplatense',
    emailRemitente: 'tarjetas@bancorioplatense.com.ar',
    asunto: 'Validación necesaria para liberar la tarjeta corporativa',
    fechaRelativa: 'hoy',
    prioridad: 'alta',
    cuerpo:
      'Estimados,\n\nDetectamos una diferencia en la autorización de la tarjeta corporativa y suspendimos temporalmente su uso. Enviamos el formulario para confirmar a los responsables habilitados.\n\nPor favor respondan cuanto antes para liberar los pagos de viajes que quedaron pendientes.\n\nBanco Rioplatense',
    adjuntos: [{ nombre: 'tarjeta_corporativa.pdf', tamano: '480 KB' }],
  },
  {
    id: 'b3c5',
    remitente: 'Santiago Molina',
    emailRemitente: 'santiago.molina@ucu.edu.uy',
    asunto: 'El sistema de facturación se cayó, nadie puede emitir comprobantes',
    fechaRelativa: 'anterior',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nDesde hace una hora el sistema de facturación no responde y ya se está acumulando una fila de clientes esperando su comprobante en el local. Reinicié el servicio dos veces y sigue igual.\n\nNecesito que alguien de guardia lo revise ya, esto está parando la operación.\n\nGracias,\nSantiago Molina',
    adjuntos: [{ nombre: 'registro_facturacion.txt', tamano: '24 KB' }],
  },
  {
    id: 'b3c6',
    remitente: 'Antonella Castro',
    emailRemitente: 'antonella.castro@ucu.edu.uy',
    asunto: 'Modelo de adaptador para la sala de reuniones',
    fechaRelativa: 'hoy',
    prioridad: 'baja',
    cuerpo:
      'Hola,\n\nLes paso una foto del adaptador que usamos en la sala de reuniones para que puedan identificar el modelo al preparar el inventario.\n\nCuando revisen los equipos disponibles, avísenme si hay alguno de repuesto. No hace falta comprarlo todavía.\n\nGracias,\nAntonella',
    adjuntos: [{ nombre: 'adaptador_hdmi.png', tamano: '620 KB' }],
  },
  {
    id: 'b3c7',
    remitente: 'Bruno Ortega',
    emailRemitente: 'bruno.ortega@ucu.edu.uy',
    asunto: 'Cotización de insumos: necesito tu visto bueno para liberar la compra',
    fechaRelativa: 'anterior',
    prioridad: 'alta',
    cuerpo:
      'Hola,\n\nLes envío la cotización final del proveedor para los insumos del laboratorio. Necesitamos aprobarla de inmediato: la reserva de materiales vence al cierre del día y no hay stock alternativo.\n\nPor favor confirmen el visto bueno para asegurar la entrega.\n\nSaludos,\nBruno Ortega',
    adjuntos: [{ nombre: 'cotizacion_insumos.pdf', tamano: '205 KB' }],
  },
  {
    id: 'b3c8',
    remitente: 'ProveeTech Insumos',
    emailRemitente: 'ventas@proveetech.com.ar',
    asunto: 'Sustitución urgente de equipos del pedido',
    fechaRelativa: 'hoy',
    prioridad: 'alta',
    cuerpo:
      'Estimados,\n\nEl fabricante retiró uno de los modelos incluidos en su pedido. Les compartimos las alternativas equivalentes disponibles para despacho.\n\nNecesitamos que elijan una opción cuanto antes para mantener la fecha de entrega acordada.\n\nSaludos,\nProveeTech Insumos',
    adjuntos: [{ nombre: 'equipos_sustitutos.xlsx', tamano: '96 KB' }],
  },
];

/** Regla y atributos se verifican sobre los mismos datos que se muestran. */
export function crearCorpusSesion(referenciaSesion: Date): Email[][] {
  return [CORPUS_BLOQUE_1, CORPUS_BLOQUE_2, CORPUS_BLOQUE_3].map((bloque, indiceBloque) =>
    bloque.map(({ fechaRelativa, ...plantilla }, indice) => {
      const email: Email = {
        ...plantilla,
        adjuntos: plantilla.adjuntos.map(archivo => ({ ...archivo })),
        destinatario: 'Estudiante <correo de estudiante>',
        fechaISO: crearFechaCorreo(fechaRelativa, indice, referenciaSesion),
      };
      const atributos = atributosCorreo(email, referenciaSesion);
      if (Object.values(atributos).filter(Boolean).length !== 3 ||
          !atributos[SESSION_CONFIG.ordenCriterios[indiceBloque]]) {
        throw new Error(`Atributos incompatibles con el bloque: ${email.id}`);
      }
      return email;
    }),
  );
}
