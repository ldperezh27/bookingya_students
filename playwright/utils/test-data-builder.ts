import { guestDefaults, reservationDefaults, roomDefaults } from '../data/reservation-data';
import { uniqueSuffix } from './ids';

/**
 * Payload de creación de huésped según el contrato observable del backend.
 */
export interface GuestInput {
  identification: string;
  name: string;
  email: string;
}

export interface RoomInput {
  code: string;
  name: string;
  city: string;
  maxGuests: number;
  nightlyPrice: number;
  available: boolean;
}

export interface ReservationInput {
  guestId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  notes?: string;
}

export interface ReservationBuildOptions {
  guestId: string;
  roomId: string;
  checkInOffsetDays?: number;
  durationDays?: number;
  guestsCount?: number;
  notes?: string;
}

/**
 * Construye un huésped único para evitar dependencia de datos preexistentes.
 */
export function buildGuestInput(overrides: Partial<GuestInput> = {}): GuestInput {
  const suffix = uniqueSuffix();

  return {
    identification: `${guestDefaults.identificationPrefix}-${suffix}`,
    name: `${guestDefaults.name} ${suffix}`,
    email: `atdd-${suffix}@${guestDefaults.emailDomain}`,
    ...overrides,
  };
}

/**
 * Construye una habitación disponible para soportar escenarios de reserva.
 */
export function buildRoomInput(overrides: Partial<RoomInput> = {}): RoomInput {
  const suffix = uniqueSuffix();

  return {
    code: `${roomDefaults.codePrefix}-${suffix}`.slice(0, 40),
    name: `${roomDefaults.name} ${suffix}`,
    city: roomDefaults.city,
    maxGuests: roomDefaults.maxGuests,
    nightlyPrice: roomDefaults.nightlyPrice,
    available: roomDefaults.available,
    ...overrides,
  };
}

/**
 * Construye una reserva válida usando fechas futuras y un rango consistente.
 */
export function buildReservationInput(options: ReservationBuildOptions): ReservationInput {
  const checkInOffsetDays = options.checkInOffsetDays ?? 10;
  const durationDays = options.durationDays ?? 2;
  const checkIn = addDays(checkInOffsetDays);
  const checkOut = addDays(checkInOffsetDays + durationDays);

  return {
    guestId: options.guestId,
    roomId: options.roomId,
    checkIn,
    checkOut,
    guestsCount: options.guestsCount ?? reservationDefaults.guestsCount,
    notes: options.notes ?? reservationDefaults.notes,
  };
}

/**
 * Devuelve un LocalDateTime serializado sin zona horaria, compatible con Spring.
 */
function addDays(daysToAdd: number): string {
  const date = new Date();
  date.setUTCHours(14, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().slice(0, 19);
}
