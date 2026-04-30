import { test } from '@playwright/test';

import { ReservationApi } from '../../services/reservation-api';
import { expectReservationResponse } from '../../utils/assertions';
import { buildReservationInput } from '../../utils/test-data-builder';
import { cleanupReservationArtifacts, provisionReservationPreconditions } from './reservation-test-support';

/**
 * Criterio de aceptación:
 * una reserva válida debe crearse con HTTP 200, devolver un identificador y
 * permitir su consulta posterior con el mismo contenido funcional.
 */
test('Crear una reserva correctamente', async ({ request }) => {
  const reservationApi = new ReservationApi(request);
  const preconditions = await provisionReservationPreconditions(request);
  const cleanup = preconditions.cleanup;

  try {
    const payload = buildReservationInput({
      guestId: preconditions.guest.id,
      roomId: preconditions.room.id,
    });

    await test.step('Registrar una reserva válida', async () => {
      const response = await reservationApi.create(payload);
      const createdReservation = await expectReservationResponse(response, payload);
      cleanup.reservationId = createdReservation.id;
    });

    await test.step('Consultar la reserva creada por su identificador', async () => {
      const response = await reservationApi.getById(cleanup.reservationId!);
      await expectReservationResponse(response, payload);
    });
  } finally {
    await cleanupReservationArtifacts(request, cleanup);
  }
});
