import { expect, test } from './apoyo'

test('una publicación agregada en un día aparece en el calendario y se guarda', async ({
  page,
}) => {
  await page.goto('/contenido')
  // El día 15 existe en todos los meses, así la prueba no depende de cuándo se corra.
  await page.getByRole('button', { name: /^Agregar publicación el 15 de / }).click()
  await page.getByLabel('Título de la publicación 1').fill('Sesión de técnica de curva')
  await page.getByLabel('Estado de la publicación 1').selectOption('Publicado')
  await page.getByLabel('Vistas').fill('4000')
  await page.getByLabel('Interacciones').fill('400')

  await expect(page.getByRole('button', { name: /Sesión de técnica de curva/ })).toBeVisible()
  await expect(page.locator('.ui-indicador').filter({ hasText: 'Publicadas' })).toContainText('1')
  // 400 interacciones sobre 4.000 vistas.
  await expect(page.getByText('10 % interacción')).toBeVisible()

  await page.reload()
  await expect(page.getByLabel('Título de la publicación 1')).toHaveValue(
    'Sesión de técnica de curva',
  )
})
