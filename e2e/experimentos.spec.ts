import { expect, test } from './apoyo'

/*
  Estas dos herramientas descargan un modelo de visión cuando se usan. Aquí solo se prueba
  lo que no depende de esa descarga ni de una cámara: que la pantalla quede lista para empezar.
*/

test('el análisis de salto espera un video y no deja subir otra cosa', async ({ page }) => {
  await page.goto('/biomecanica')
  await expect(page.getByRole('button', { name: 'Elegir video' })).toBeVisible()
  await expect(page.locator('input[type=file]')).toHaveAttribute('accept', /video/)
})

test('el control por gestos no prende la cámara hasta que se le pide', async ({ page }) => {
  await page.goto('/gestos')
  await expect(page.getByRole('button', { name: 'Activar cámara' })).toBeVisible()
  await page.getByRole('radio', { name: 'Dibujo' }).check()
  await expect(page.getByRole('button', { name: 'Guardar dibujo' })).toBeVisible()
})
