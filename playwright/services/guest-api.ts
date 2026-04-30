import { APIRequestContext, APIResponse } from '@playwright/test';

import type { GuestInput } from '../utils/test-data-builder';
import { ApiClient } from './api-client';

/**
 * Fachada de huésped usada como soporte de precondiciones ATDD.
 */
export class GuestApi {
  private readonly client: ApiClient;

  constructor(request: APIRequestContext) {
    this.client = new ApiClient(request);
  }

  /**
   * Crea huéspedes necesarios para escenarios de reservas.
   */
  create(payload: GuestInput): Promise<APIResponse> {
    return this.client.post('/guest', payload);
  }

  /**
   * Elimina huéspedes creados por la suite para reducir residuos de prueba.
   */
  delete(id: string): Promise<APIResponse> {
    return this.client.delete(`/guest/${id}`);
  }
}
