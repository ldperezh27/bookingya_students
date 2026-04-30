import { test } from '@playwright/test';

import { ReservationApi } from '../../services/reservation-api';
import { expectReservationListIncludes, expectReservationResponse } from '../../utils/assertions';
import { buildReservationInput } from '../../utils/test-data-builder';
import { cleanupReservationArtifacts, provisionReservationPreconditions } from './reservation-test-support';

/**
 * Criterio de aceptación:
 * el listado general debe incluir la reserva creada por el escenario sin asumir
 * un tamaño fijo del conjunto de datos.
 */
test('Consultar todas las reservas', async ({ request }) => {
  const reservationApi = new ReservationApi(request);
  const preconditions = await provisionReservationPreconditions(request);
  const cleanup = preconditions.cleanup;

  try {
    const payload = buildReservationInput({
      guestId: preconditions.guest.id,
      roomId: preconditions.room.id,
      checkInOffsetDays: 14,
    });

    const createdReservation = await expectReservationResponse(await reservationApi.create(payload), payload);
    cleanup.reservationId = createdReservation.id;

    await test.step('Listar reservas e identificar la creada por la prueba', async () => {
      const response = await reservationApi.list();
      await expectReservationListIncludes(response, createdReservation.id);
    });
  } finally {
    await cleanupReservationArtifacts(request, cleanup);
  }
});
