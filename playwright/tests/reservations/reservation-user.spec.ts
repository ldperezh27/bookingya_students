import { expect, test } from '@playwright/test';

import { ReservationApi } from '../../services/reservation-api';
import { expectReservationResponse, type ReservationView } from '../../utils/assertions';
import { buildReservationInput } from '../../utils/test-data-builder';
import { cleanupReservationArtifacts, provisionReservationPreconditions } from './reservation-test-support';

/**
 * Criterio de aceptación:
 * el backend debe devolver las reservas asociadas al huésped consultado usando
 * la ruta real implementada por la API.
 */
test('Consultar reservas por huésped', async ({ request }) => {
  const reservationApi = new ReservationApi(request);
  const preconditions = await provisionReservationPreconditions(request);
  const cleanup = preconditions.cleanup;

  try {
    const payload = buildReservationInput({
      guestId: preconditions.guest.id,
      roomId: preconditions.room.id,
      checkInOffsetDays: 16,
    });

    const createdReservation = await expectReservationResponse(await reservationApi.create(payload), payload);
    cleanup.reservationId = createdReservation.id;

    await test.step('Consultar las reservas del huésped creado para la prueba', async () => {
      const response = await reservationApi.listByGuest(preconditions.guest.id);
      expect(response.status()).toBe(200);

      const reservations = (await response.json()) as ReservationView[];
      expect(Array.isArray(reservations)).toBe(true);
      expect(
        reservations.some((reservation) => reservation.id === createdReservation.id),
      ).toBe(true);
      expect(
        reservations.every((reservation) => reservation.guestId === preconditions.guest.id),
      ).toBe(true);
    });
  } finally {
    await cleanupReservationArtifacts(request, cleanup);
  }
});
