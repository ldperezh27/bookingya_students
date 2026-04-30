import path from 'node:path';

import dotenv from 'dotenv';

/**
 * Variables de entorno relevantes para la suite.
 */
export interface TestEnvironment {
  baseUrl: string;
  apiTimeoutMs: number;
  testTimeoutMs: number;
}

let cachedEnv: TestEnvironment | undefined;

/**
 * Carga y normaliza la configuración de entorno una sola vez por proceso.
 */
export function loadEnv(): TestEnvironment {
  if (cachedEnv) {
    return cachedEnv;
  }

  dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

  cachedEnv = {
    baseUrl: trimTrailingSlash(process.env.BASE_URL ?? 'http://localhost:8080/api'),
    apiTimeoutMs: parseNumber('API_TIMEOUT_MS', process.env.API_TIMEOUT_MS, 15_000),
    testTimeoutMs: parseNumber('TEST_TIMEOUT_MS', process.env.TEST_TIMEOUT_MS, 30_000),
  };

  return cachedEnv;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

/**
 * Valida variables numéricas para fallar temprano ante configuraciones inválidas.
 */
function parseNumber(name: string, rawValue: string | undefined, fallback: number): number {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);

  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`La variable ${name} debe ser un número mayor que cero.`);
  }

  return parsed;
}
