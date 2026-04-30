import { test } from '@playwright/test';

import { ReservationApi } from '../../services/reservation-api';
import { expectDeleteSucceeded, expectErrorResponse, expectReservationResponse } from '../../utils/assertions';
import { buildReservationInput } from '../../utils/test-data-builder';
import { cleanupReservationArtifacts, provisionReservationPreconditions } from './reservation-test-support';

/**
 * Criterio de aceptación:
 * una reserva existente debe poder eliminarse y dejar de estar disponible en
 * consultas posteriores por identificador.
 */
test('Eliminar una reserva existente', async ({ request }) => {
  const reservationApi = new ReservationApi(request);
  const preconditions = await provisionReservationPreconditions(request);
  const cleanup = preconditions.cleanup;

  try {
    const payload = buildReservationInput({
      guestId: preconditions.guest.id,
      roomId: preconditions.room.id,
      checkInOffsetDays: 24,
    });

    const createdReservation = await expectReservationResponse(await reservationApi.create(payload), payload);
    cleanup.reservationId = createdReservation.id;

    await test.step('Eliminar la reserva existente', async () => {
      const deleteResponse = await reservationApi.delete(createdReservation.id);
      await expectDeleteSucceeded(deleteResponse);
      cleanup.reservationId = undefined;
    });

    await test.step('Confirmar que la reserva ya no existe', async () => {
      const getResponse = await reservationApi.getById(createdReservation.id);
      await expectErrorResponse(getResponse, 404, 'Reservation not found');
    });
  } finally {
    await cleanupReservationArtifacts(request, cleanup);
  }
});
