import { test } from '@playwright/test';

import { ReservationApi } from '../../services/reservation-api';
import { expectReservationResponse } from '../../utils/assertions';
import { buildReservationInput } from '../../utils/test-data-builder';
import { cleanupReservationArtifacts, provisionReservationPreconditions } from './reservation-test-support';

/**
 * Criterio de aceptación:
 * una reserva existente debe aceptar una actualización válida y persistir los
 * cambios observables cuando se consulta nuevamente.
 */
test('Actualizar una reserva existente', async ({ request }) => {
  const reservationApi = new ReservationApi(request);
  const preconditions = await provisionReservationPreconditions(request);
  const cleanup = preconditions.cleanup;

  try {
    const initialPayload = buildReservationInput({
      guestId: preconditions.guest.id,
      roomId: preconditions.room.id,
      checkInOffsetDays: 18,
      notes: 'Reserva original creada para ATDD.',
    });

    const createdReservation = await expectReservationResponse(
      await reservationApi.create(initialPayload),
      initialPayload,
    );
    cleanup.reservationId = createdReservation.id;

    const updatedPayload = buildReservationInput({
      guestId: preconditions.guest.id,
      roomId: preconditions.room.id,
      checkInOffsetDays: 22,
      durationDays: 3,
      notes: 'Reserva actualizada desde la suite ATDD.',
    });

    await test.step('Actualizar la reserva con datos válidos', async () => {
      const updateResponse = await reservationApi.update(createdReservation.id, updatedPayload);
      await expectReservationResponse(updateResponse, updatedPayload);
    });

    await test.step('Verificar que los cambios quedaron persistidos', async () => {
      const getResponse = await reservationApi.getById(createdReservation.id);
      await expectReservationResponse(getResponse, updatedPayload);
    });
  } finally {
    await cleanupReservationArtifacts(request, cleanup);
  }
});
