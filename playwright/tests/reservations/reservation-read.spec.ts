import { test } from '@playwright/test';

import { ReservationApi } from '../../services/reservation-api';
import { expectReservationResponse } from '../../utils/assertions';
import { buildReservationInput } from '../../utils/test-data-builder';
import { cleanupReservationArtifacts, provisionReservationPreconditions } from './reservation-test-support';

/**
 * Criterio de aceptación:
 * una reserva existente debe poder consultarse por su identificador.
 */
test('Consultar una reserva por ID', async ({ request }) => {
  const reservationApi = new ReservationApi(request);
  const preconditions = await provisionReservationPreconditions(request);
  const cleanup = preconditions.cleanup;

  try {
    const payload = buildReservationInput({
      guestId: preconditions.guest.id,
      roomId: preconditions.room.id,
      checkInOffsetDays: 12,
    });

    const createdReservation = await expectReservationResponse(await reservationApi.create(payload), payload);
    cleanup.reservationId = createdReservation.id;

    await test.step('Consultar la reserva existente', async () => {
      const response = await reservationApi.getById(createdReservation.id);
      await expectReservationResponse(response, payload);
    });
  } finally {
    await cleanupReservationArtifacts(request, cleanup);
  }
});
