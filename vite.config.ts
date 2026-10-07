import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    // Para abrir el sitio desde el celular por la IP de la red local.
    host: true,
  },
  test: {
    // Las pruebas son de lógica pura, así que no necesitan simular un navegador.
    environment: 'node',
    include: ['apps/**/*.test.ts', 'shared/**/*.test.ts'],
  },
})
