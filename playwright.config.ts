import { defineConfig, devices } from '@playwright/test'

const PUERTO = 4173

/**
 * Pruebas de punta a punta: abren el sitio ya construido en un navegador de verdad
 * y lo usan como lo usaría una persona.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Se prueba lo mismo que se publica: el sitio construido, no el servidor de desarrollo.
    command: `npm run build && npm run preview -- --port ${PUERTO} --strictPort`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: true,
  },
})
