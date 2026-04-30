import { APIResponse, expect } from '@playwright/test';

import type { GuestInput, ReservationInput, RoomInput } from './test-data-builder';

/**
 * Representación observable de huésped devuelta por la API.
 */
export interface GuestView {
  id: string;
  identification: string;
  name: string;
  email: string;
}

export interface RoomView {
  id: string;
  code: string;
  name: string;
  city: string;
  maxGuests: number;
  nightlyPrice: number;
  available: boolean;
}

export interface ReservationView {
  id: string;
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  notes?: string | null;
}

export interface ErrorView {
  error: string;
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Valida el contrato HTTP y de negocio observable al crear un huésped.
 */
export async function expectGuestResponse(
  response: APIResponse,
  expected: GuestInput,
): Promise<GuestView> {
  expect(response.status()).toBe(200);
  const body = (await response.json()) as GuestView;

  expectUuid(body.id, 'guest.id');
  expect(body.identification).toBe(expected.identification);
  expect(body.name).toBe(expected.name);
  expect(body.email).toBe(expected.email);

  return body;
}

/**
 * Valida el contrato HTTP y de negocio observable al crear una habitación.
 */
export async function expectRoomResponse(
  response: APIResponse,
  expected: RoomInput,
): Promise<RoomView> {
  expect(response.status()).toBe(200);
  const body = (await response.json()) as RoomView;

  expectUuid(body.id, 'room.id');
  expect(body.code).toBe(expected.code);
  expect(body.name).toBe(expected.name);
  expect(body.city).toBe(expected.city);
  expect(body.maxGuests).toBe(expected.maxGuests);
  expect(body.available).toBe(expected.available);

  return body;
}

/**
 * Valida el contrato HTTP y la forma de una reserva devuelta por la API.
 */
export async function expectReservationResponse(
  response: APIResponse,
  expected: ReservationInput,
): Promise<ReservationView> {
  expect(response.status()).toBe(200);
  const body = (await response.json()) as ReservationView;

  expectUuid(body.id, 'reservation.id');
  expect(body.guestId).toBe(expected.guestId);
  expect(body.roomId).toBe(expected.roomId);
  expect(body.checkIn).toBe(expected.checkIn);
  expect(body.checkOut).toBe(expected.checkOut);
  expect(body.guestsCount).toBe(expected.guestsCount);
  expect(body.notes ?? '').toBe(expected.notes ?? '');

  return body;
}

/**
 * Valida listados sin depender de conteos absolutos del sistema.
 */
export async function expectReservationListIncludes(
  response: APIResponse,
  reservationId: string,
): Promise<ReservationView[]> {
  expect(response.status()).toBe(200);
  const body = (await response.json()) as ReservationView[];

  expect(Array.isArray(body)).toBe(true);
  expect(body.some((reservation) => reservation.id === reservationId)).toBe(true);

  return body;
}

/**
 * Valida el comportamiento observable del DELETE de reservas.
 */
export async function expectDeleteSucceeded(response: APIResponse): Promise<void> {
  expect(response.status()).toBe(200);
  expect(await response.text()).toBe('');
}

/**
 * Estandariza la validación de errores funcionales y de recursos inexistentes.
 */
export async function expectErrorResponse(
  response: APIResponse,
  expectedStatus: number,
  expectedMessage: string,
): Promise<ErrorView> {
  expect(response.status()).toBe(expectedStatus);
  const body = (await response.json()) as ErrorView;

  expect(body.error).toBe(expectedMessage);
  return body;
}

function expectUuid(value: string, label: string): void {
  expect(value, `${label} debe ser un UUID válido.`).toMatch(uuidPattern);
}
