import { APIRequestContext } from '@playwright/test';

import { GuestApi } from '../../services/guest-api';
import { ReservationApi } from '../../services/reservation-api';
import { RoomApi } from '../../services/room-api';
import { expectGuestResponse, expectRoomResponse, type GuestView, type RoomView } from '../../utils/assertions';
import { buildGuestInput, buildRoomInput } from '../../utils/test-data-builder';

/**
 * Referencias mínimas para limpiar recursos creados por cada escenario.
 */
export interface CleanupRegistry {
  reservationId?: string;
  roomId?: string;
  guestId?: string;
}

/**
 * Agrega las precondiciones que un escenario de reservas necesita para operar
 * sobre entidades reales sin depender de datos manuales.
 */
export interface ReservationPreconditions {
  guest: GuestView;
  room: RoomView;
  cleanup: CleanupRegistry;
}

/**
 * Crea huésped y habitación válidos antes de ejecutar un escenario ATDD.
 */
export async function provisionReservationPreconditions(
  request: APIRequestContext,
): Promise<ReservationPreconditions> {
  const guestApi = new GuestApi(request);
  const roomApi = new RoomApi(request);

  const guestPayload = buildGuestInput();
  const guest = await expectGuestResponse(await guestApi.create(guestPayload), guestPayload);

  const roomPayload = buildRoomInput();
  const room = await expectRoomResponse(await roomApi.create(roomPayload), roomPayload);

  return {
    guest,
    room,
    cleanup: {
      guestId: guest.id,
      roomId: room.id,
    },
  };
}

/**
 * Limpia artefactos de prueba en el orden seguro para evitar referencias huérfanas.
 */
export async function cleanupReservationArtifacts(
  request: APIRequestContext,
  cleanup: CleanupRegistry,
): Promise<void> {
  const reservationApi = new ReservationApi(request);
  const roomApi = new RoomApi(request);
  const guestApi = new GuestApi(request);

  if (cleanup.reservationId) {
    await allowNotFound(reservationApi.delete(cleanup.reservationId));
  }

  if (cleanup.roomId) {
    await allowNotFound(roomApi.delete(cleanup.roomId));
  }

  if (cleanup.guestId) {
    await allowNotFound(guestApi.delete(cleanup.guestId));
  }
}

/**
 * Permite reruns estables aceptando 404 cuando el recurso ya no existe.
 */
async function allowNotFound(responsePromise: Promise<{ status(): number }>): Promise<void> {
  const response = await responsePromise;

  if (![200, 404].includes(response.status())) {
    throw new Error(`El cleanup devolvió un estado inesperado: ${response.status()}`);
  }
}
