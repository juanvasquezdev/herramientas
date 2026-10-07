import { herramientas } from '../src/herramientas'
import { desbordeHorizontal, expect, test } from './apoyo'

test('el inicio muestra todas las herramientas del registro', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Herramientas' })).toBeVisible()
  for (const { nombre } of herramientas) {
    await expect(page.getByRole('link', { name: nombre })).toBeVisible()
  }
  await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(herramientas.length)
})

// Una prueba por cada herramienta del registro: la que se agregue queda cubierta sola.
for (const { ruta, nombre } of herramientas) {
  test(`${nombre}: abre por su dirección y cabe en un celular`, async ({ page }) => {
    await page.goto(`/${ruta}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page).toHaveTitle(`${nombre} · Herramientas`)

    await page.setViewportSize({ width: 390, height: 844 })
    expect(await desbordeHorizontal(page)).toBeLessThanOrEqual(0)
  })
}

test('desde el inicio se entra a una herramienta y se vuelve', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Cotizador' }).click()
  await expect(page).toHaveURL(/\/cotizador$/)
  await page.getByRole('link', { name: 'Herramientas' }).click()
  await expect(page).toHaveURL(/\/$/)
})

test('una dirección que no existe ofrece volver al inicio', async ({ page }) => {
  await page.goto('/no-existe')
  await page.getByRole('link', { name: 'Volver al inicio' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Herramientas' })).toBeVisible()
})
