import crypto from 'node:crypto';

/**
 * Genera un sufijo corto y suficientemente único para identificar datos de prueba.
 */
export function uniqueSuffix(): string {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Expone UUIDs aleatorios para escenarios negativos sobre recursos inexistentes.
 */
export function randomUuid(): string {
  return crypto.randomUUID();
}
