import { APIRequestContext, APIResponse } from '@playwright/test';

import { loadEnv } from '../utils/env';

type QueryParams = Record<string, string | number | boolean>;

/**
 * Cliente HTTP mínimo para centralizar timeouts, base URL y manejo homogéneo
 * de respuestas sin lanzar excepciones por códigos HTTP esperados en ATDD.
 */
export class ApiClient {
  private readonly timeoutMs: number;
  private readonly baseUrl: string;

  constructor(private readonly request: APIRequestContext) {
    const env = loadEnv();
    this.baseUrl = env.baseUrl;
    this.timeoutMs = env.apiTimeoutMs;
  }

  get(path: string, params?: QueryParams): Promise<APIResponse> {
    return this.request.get(this.buildUrl(path), {
      failOnStatusCode: false,
      params,
      timeout: this.timeoutMs,
    });
  }

  post(path: string, data: unknown): Promise<APIResponse> {
    return this.request.post(this.buildUrl(path), {
      data,
      failOnStatusCode: false,
      timeout: this.timeoutMs,
    });
  }

  put(path: string, data: unknown): Promise<APIResponse> {
    return this.request.put(this.buildUrl(path), {
      data,
      failOnStatusCode: false,
      timeout: this.timeoutMs,
    });
  }

  delete(path: string): Promise<APIResponse> {
    return this.request.delete(this.buildUrl(path), {
      failOnStatusCode: false,
      timeout: this.timeoutMs,
    });
  }

  /**
   * Acepta rutas relativas para mantener las specs enfocadas en comportamiento
   * y no en detalles de infraestructura.
   */
  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
