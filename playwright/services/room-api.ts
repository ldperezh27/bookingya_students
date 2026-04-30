import { APIRequestContext, APIResponse } from '@playwright/test';

import type { RoomInput } from '../utils/test-data-builder';
import { ApiClient } from './api-client';

/**
 * Fachada de habitación usada para preparar y limpiar precondiciones.
 */
export class RoomApi {
  private readonly client: ApiClient;

  constructor(request: APIRequestContext) {
    this.client = new ApiClient(request);
  }

  /**
   * Crea una habitación válida para soportar escenarios de reserva.
   */
  create(payload: RoomInput): Promise<APIResponse> {
    return this.client.post('/room', payload);
  }

  /**
   * Elimina la habitación de prueba cuando la reserva asociada ya no existe.
   */
  delete(id: string): Promise<APIResponse> {
    return this.client.delete(`/room/${id}`);
  }
}
