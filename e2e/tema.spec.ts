import { expect, test } from './apoyo'

/** El tema que está puesto en <html data-tema="…">, que es de donde lo leen los estilos. */
const temaPuesto = 'html[data-tema]'

test.describe('con el equipo en tema claro', () => {
  test.use({ colorScheme: 'light' })

  test('el tema se cambia con el botón y se recuerda al recargar', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(temaPuesto)).toHaveAttribute('data-tema', 'claro')

    await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click()
    await expect(page.locator(temaPuesto)).toHaveAttribute('data-tema', 'oscuro')

    await page.reload()
    await expect(page.locator(temaPuesto)).toHaveAttribute('data-tema', 'oscuro')
    await expect(page.getByRole('button', { name: 'Cambiar a tema claro' })).toBeVisible()
  })
})

test.describe('con el equipo en tema oscuro', () => {
  test.use({ colorScheme: 'dark' })

  test('sin haber elegido, el sitio sigue el tema del equipo', async ({ page }) => {
    await page.goto('/cargas')
    await expect(page.locator(temaPuesto)).toHaveAttribute('data-tema', 'oscuro')
  })

  test('lo que se imprime sale en claro aunque el tema sea oscuro', async ({ page }) => {
    await page.goto('/marcas')
    const colorDelTexto = () => page.evaluate(() => getComputedStyle(document.body).color)

    // En pantalla, con tema oscuro, el texto es claro.
    expect(await colorDelTexto()).toBe('rgb(241, 242, 247)')

    // En el papel vuelve a ser oscuro sobre blanco.
    await page.emulateMedia({ media: 'print' })
    expect(await colorDelTexto()).toBe('rgb(23, 26, 38)')
  })
})
