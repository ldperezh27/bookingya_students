import { APIRequestContext, APIResponse } from '@playwright/test';

import type { ReservationInput } from '../utils/test-data-builder';
import { ApiClient } from './api-client';

/**
 * Fachada del dominio de reservas. Encapsula las rutas reales del backend
 * para que las specs expresen criterios de aceptación y no detalles HTTP.
 */
export class ReservationApi {
  private readonly client: ApiClient;

  constructor(request: APIRequestContext) {
    this.client = new ApiClient(request);
  }

  /**
   * Recupera el listado completo observable de reservas.
   */
  list(): Promise<APIResponse> {
    return this.client.get('/reservation');
  }

  /**
   * Consulta una reserva por identificador.
   */
  getById(id: string): Promise<APIResponse> {
    return this.client.get(`/reservation/${id}`);
  }

  /**
   * Usa la ruta real del backend para consultar reservas por huésped.
   */
  listByGuest(guestId: string): Promise<APIResponse> {
    return this.client.get(`/reservation/guest/${guestId}`);
  }

  /**
   * Registra una nueva reserva.
   */
  create(payload: ReservationInput): Promise<APIResponse> {
    return this.client.post('/reservation', payload);
  }

  /**
   * Actualiza una reserva existente sin alterar su identificador.
   */
  update(id: string, payload: ReservationInput): Promise<APIResponse> {
    return this.client.put(`/reservation/${id}`, payload);
  }

  /**
   * Elimina una reserva del sistema.
   */
  delete(id: string): Promise<APIResponse> {
    return this.client.delete(`/reservation/${id}`);
  }
}
