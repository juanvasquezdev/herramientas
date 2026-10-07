import { herramientas } from '../src/herramientas'
import { desbordeHorizontal, expect, test } from './apoyo'

test('el inicio muestra todas las herramientas del registro', async ({ page }) => {
  await page.goto('/')
  // Se busca dentro del contenido: la barra de abajo también tiene un enlace por herramienta.
  const contenido = page.getByRole('main')
  await expect(contenido.getByRole('heading', { level: 1, name: 'Herramientas' })).toBeVisible()
  for (const { nombre } of herramientas) {
    await expect(contenido.getByRole('link', { name: nombre })).toBeVisible()
  }
  await expect(contenido.getByRole('listitem')).toHaveCount(herramientas.length)
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
  await page.getByRole('main').getByRole('link', { name: 'Cotizador' }).click()
  await expect(page).toHaveURL(/\/cotizador$/)
  await page.getByRole('banner').getByRole('link', { name: 'Herramientas' }).click()
  await expect(page).toHaveURL(/\/$/)
})

test('la barra de abajo cambia de herramienta sin pasar por el inicio', async ({ page }) => {
  await page.goto('/cotizador')
  const barra = page.getByRole('navigation', { name: 'Cambiar de herramienta' })
  await expect(barra.getByRole('link', { name: 'Cotizador' })).toHaveAttribute(
    'aria-current',
    'page',
  )

  await barra.getByRole('link', { name: 'Registro de marcas' }).click()
  await expect(page).toHaveURL(/\/marcas$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Registro de marcas' })).toBeVisible()
  await expect(barra.getByRole('link', { name: 'Registro de marcas' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  // Al cambiar, el foco pasa al contenido nuevo: quien usa teclado no queda perdido.
  await expect(page.getByRole('main')).toBeFocused()
})

test('con el teclado se llega a la barra de abajo de un salto', async ({ page }) => {
  await page.goto('/propuesta')
  // El atajo es lo primero que recibe el foco: así no hay que recorrer todo el formulario.
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Ir a cambiar de herramienta' })).toBeFocused()

  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  const barra = page.getByRole('navigation', { name: 'Cambiar de herramienta' })
  await expect(barra.getByRole('link', { name: 'Inicio' })).toBeFocused()
})

test('una dirección que no existe ofrece volver al inicio', async ({ page }) => {
  await page.goto('/no-existe')
  await page.getByRole('link', { name: 'Volver al inicio' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Herramientas' })).toBeVisible()
})
