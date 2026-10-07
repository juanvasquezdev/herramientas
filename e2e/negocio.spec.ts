import { campoDe, expect, test } from './apoyo'

test('el cotizador suma, cobra el impuesto y recuerda todo al recargar', async ({ page }) => {
  await page.goto('/cotizador')
  await campoDe(page, 'Tu empresa', 'Nombre').fill('Taller Creativo')
  await campoDe(page, 'Cliente', 'Nombre').fill('Marta Ruiz')
  await page.getByLabel('Descripción del ítem 1').fill('Página web')
  await page.getByLabel('Precio del ítem 1').fill('800000')
  await page.getByRole('button', { name: 'Agregar ítem' }).click()
  await page.getByLabel('Descripción del ítem 2').fill('Sesión de fotos')
  await page.getByLabel('Cantidad del ítem 2').fill('2')
  await page.getByLabel('Precio del ítem 2').fill('100000')

  // 800.000 + 2 × 100.000 = 1.000.000; con el 19 % de impuesto, 1.190.000.
  const totales = page.locator('dl').first()
  await expect(totales).toContainText('$1.000.000,00')
  await expect(totales).toContainText('$190.000,00')
  await expect(totales).toContainText('$1.190.000,00')

  await page.reload()
  await expect(page.getByLabel('Descripción del ítem 2')).toHaveValue('Sesión de fotos')
  await expect(campoDe(page, 'Cliente', 'Nombre')).toHaveValue('Marta Ruiz')
})

test('los datos de la empresa se escriben una vez y sirven en la propuesta', async ({ page }) => {
  await page.goto('/cotizador')
  await campoDe(page, 'Tu empresa', 'Nombre').fill('Taller Creativo')

  await page.goto('/propuesta')
  await expect(campoDe(page, 'Tu empresa', 'Nombre')).toHaveValue('Taller Creativo')
})

test('la propuesta reparte el valor en pagos que suman exacto', async ({ page }) => {
  await page.goto('/propuesta')
  await page.getByLabel('Valor total').fill('1000000')
  await page.getByRole('button', { name: 'Agregar pago' }).click()
  await page.getByLabel('Porcentaje del pago 1').fill('33.33')
  await page.getByLabel('Porcentaje del pago 2').fill('33.33')
  await page.getByLabel('Porcentaje del pago 3').fill('30')
  await expect(page.getByText('Los pagos suman 96,66 %')).toBeVisible()

  await page.getByLabel('Porcentaje del pago 3').fill('33.34')
  await expect(page.getByText('Los pagos suman')).toHaveCount(0)
  await expect(page.locator('output')).toHaveText(['$333.300,00', '$333.300,00', '$333.400,00'])
})

test('rentabilidad calcula el precio y avisa cuando se vende a pérdida', async ({ page }) => {
  await page.goto('/rentabilidad')
  await page.getByLabel('Costos por unidad: valor del costo 1').fill('12000')
  await page.getByLabel('Costos fijos al mes: valor del costo 1').fill('300000')
  await page.getByLabel('Unidades que vendes al mes').fill('100')
  await page.getByLabel('Comisión por venta (%)').fill('5')
  await page.getByLabel('Margen que quieres (%)').fill('25')

  // Costo por unidad: 12.000 + 300.000 / 100 = 15.000. Precio: 15.000 / (1 − 0,25 − 0,05).
  const indicadores = page.locator('.ui-indicador')
  await expect(indicadores.filter({ hasText: 'Precio de venta sugerido' })).toContainText(
    '$21.428,57',
  )
  await expect(indicadores.filter({ hasText: 'Punto de equilibrio' })).toContainText('36 unidades')

  await page.getByRole('radio', { name: 'Ya tengo un precio' }).check()
  await page.getByLabel('Precio al que vendes').fill('14000')
  await expect(page.getByText('A este precio pierdes $1.700,00 en cada unidad')).toBeVisible()
})
