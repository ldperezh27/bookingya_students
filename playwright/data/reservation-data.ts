/**
 * Valores base reutilizables para construir datos de prueba estables.
 *
 * Los builders completan estos valores con sufijos únicos para evitar colisiones
 * entre ejecuciones y mantener los escenarios autónomos.
 */
export const guestDefaults = {
  name: 'ATDD Guest',
  identificationPrefix: 'ATDD-GUEST',
  emailDomain: 'bookingya.test',
};

export const roomDefaults = {
  codePrefix: 'ATDD-ROOM',
  name: 'ATDD Room',
  city: 'Bogota',
  maxGuests: 2,
  nightlyPrice: 150000,
  available: true,
};

export const reservationDefaults = {
  guestsCount: 2,
  notes: 'Reserva creada por la suite ATDD de Playwright.',
};
