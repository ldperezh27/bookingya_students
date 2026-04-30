import { test } from '@playwright/test';

import { ReservationApi } from '../../services/reservation-api';
import { expectErrorResponse } from '../../utils/assertions';
import { randomUuid } from '../../utils/ids';

/**
 * Escenario negativo complementario:
 * consultar una reserva inexistente debe devolver HTTP 404 con el mensaje real
 * de error observado en el backend.
 */
test('Consultar una reserva inexistente', async ({ request }) => {
  const reservationApi = new ReservationApi(request);

  await test.step('Consultar un identificador que no existe en el sistema', async () => {
    const response = await reservationApi.getById(randomUuid());
    await expectErrorResponse(response, 404, 'Reservation not found');
  });
});
