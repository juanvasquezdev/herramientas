import { test as base, expect, type Page } from '@playwright/test'

/**
 * La misma `test` de Playwright, pero cada prueba falla si la página deja un error
 * en la consola. Así un fallo que no se ve en pantalla tampoco pasa de largo.
 */
export const test = base.extend<{ sinErroresDeConsola: undefined }>({
  sinErroresDeConsola: [
    async ({ page }, usar) => {
      const errores: string[] = []
      page.on('console', (mensaje) => {
        if (mensaje.type() === 'error') errores.push(mensaje.text())
      })
      page.on('pageerror', (error) => errores.push(error.message))
      await usar(undefined)
      expect(errores, 'errores en la consola del navegador').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

/** El campo `etiqueta` dentro de la tarjeta que tiene ese título. */
export function campoDe(page: Page, tarjeta: string, etiqueta: string) {
  return page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: tarjeta }) })
    .getByLabel(etiqueta, { exact: true })
}

/** Cuántos píxeles se sale la página por la derecha. Cero es que cabe. */
export function desbordeHorizontal(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
}
