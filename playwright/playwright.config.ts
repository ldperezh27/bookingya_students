import { defineConfig } from '@playwright/test';

import { loadEnv } from './utils/env';

const env = loadEnv();

/**
 * Configuración central de la suite ATDD.
 *
 * Se fuerza una ejecución secuencial para mantener escenarios deterministas
 * sobre una API que comparte estado persistido durante la corrida.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: env.testTimeoutMs,
  expect: {
    timeout: 5_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: env.baseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
