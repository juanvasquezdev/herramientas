# Herramientas

Ocho herramientas pequeñas para negocios y deporte. Cada una resuelve una tarea concreta, corre en el navegador, no pide cuenta y guarda los datos en el equipo de quien la usa.

Todas viven en un solo sitio: una página de inicio y una ruta por herramienta.

**En vivo:** https://juanvasquez-herramientas.vercel.app

## Qué hay

| Herramienta | Para qué sirve | Abrir | Código |
|---|---|---|---|
| **Cotizador** | Armar una cotización con ítems e impuesto y exportarla en PDF. | [/cotizador](https://juanvasquez-herramientas.vercel.app/cotizador) | [`apps/cotizador`](apps/cotizador) |
| **Propuesta de servicios** | Dejar por escrito alcance, entregables, valor y forma de pago, lista para firmar. | [/propuesta](https://juanvasquez-herramientas.vercel.app/propuesta) | [`apps/propuesta`](apps/propuesta) |
| **Precio y rentabilidad** | Saber a cómo vender para cubrir costos y ganar el margen que se quiere. | [/rentabilidad](https://juanvasquez-herramientas.vercel.app/rentabilidad) | [`apps/rentabilidad`](apps/rentabilidad) |
| **Registro de marcas** | Llevar las marcas de un atleta por prueba y ver la progresión. | [/marcas](https://juanvasquez-herramientas.vercel.app/marcas) | [`apps/marcas`](apps/marcas) |
| **Planificador de cargas** | Planear la semana de fuerza y compararla con la anterior. | [/cargas](https://juanvasquez-herramientas.vercel.app/cargas) | [`apps/cargas`](apps/cargas) |
| **Análisis de salto en video** | Medir ángulos y tiempo de contacto de un salto, cuadro por cuadro. | [/biomecanica](https://juanvasquez-herramientas.vercel.app/biomecanica) | [`apps/biomecanica`](apps/biomecanica) |
| **Calendario de contenido** | Organizar las publicaciones del mes y ver qué funciona mejor. | [/contenido](https://juanvasquez-herramientas.vercel.app/contenido) | [`apps/contenido`](apps/contenido) |
| **Control por gestos** | Manejar un reproductor, diapositivas o una pizarra con la mano frente a la cámara. | [/gestos](https://juanvasquez-herramientas.vercel.app/gestos) | [`apps/gestos`](apps/gestos) |

Cada carpeta tiene su propio README con el problema que resuelve, una captura y las decisiones que se tomaron.

## Correrlo

Necesita Node 22.22 o más reciente.

```bash
npm install
npm run dev      # abre el sitio en http://localhost:5173
```

Otros comandos:

```bash
npm test             # pruebas de la lógica (Vitest)
npm run typecheck    # revisión de tipos
npm run lint         # estilo y errores comunes (Biome)
npm run format       # lo mismo, corrigiendo lo que se puede corregir solo
npm run build        # versión de producción en dist/
npm run check        # tipos, lint, pruebas y build seguidos; es lo que corre el CI
```

Las pruebas de punta a punta abren el sitio construido en un navegador y lo usan como una persona:

```bash
npx playwright install chromium   # una sola vez
npm run e2e
```

## Cómo está organizado

```
├── apps/                  una carpeta por herramienta
│   ├── cotizador/
│   ├── propuesta/
│   └── ...
├── shared/                lo que usan varias herramientas
│   ├── ui.tsx, ui.css       página, tarjeta, campo, botón, indicador, aviso y los colores
│   ├── graficos.tsx         columnas, línea y barras, dibujadas en SVG
│   ├── documento.tsx        el membrete de los PDF
│   ├── useGuardadoLocal.ts  un useState que no se pierde al recargar
│   ├── perfil.ts            los datos de la empresa, compartidos entre herramientas
│   ├── archivoDeRespaldo.ts la copia de seguridad en un archivo
│   ├── numero.ts, dinero.ts, fecha.ts   leer y dar formato
│   ├── csv.ts, archivo.ts   exportar a Excel y descargar
│   └── vision.ts            la carga de MediaPipe, para las dos que usan la cámara o video
├── src/                   el cascarón del sitio
│   ├── herramientas.ts      el registro: de aquí salen las rutas y el inicio
│   ├── Inicio.tsx
│   └── MarcoHerramienta.tsx
└── e2e/                   pruebas de punta a punta (Playwright)
```

Dentro de cada herramienta el código se parte igual:

- **La pantalla** (`Cotizador.tsx`): formulario y estado. No hace cuentas.
- **La lógica** (`calculo.ts`, `modelo.ts`): funciones puras, sin React. Es lo que llevan las pruebas.
- **Los estilos** (`*.module.css`): solo los de esa herramienta.

## Decisiones

- **Un solo sitio y no un proyecto por herramienta.** Se instala y se despliega una vez, y el código repetido (formato de plata, guardado, botones, gráficos) existe en un solo lugar.
- **Cada herramienta se carga cuando se abre.** El registro usa `lazy()`, así la página de inicio no baja el código de las demás. Las dos que usan visión por computador pesan varios megas y solo los paga quien las abre.
- **Los datos se quedan en el navegador.** No hay servidor ni base de datos. Para una herramienta que usa una sola persona en su equipo es suficiente y no hay nada que proteger ni que pagar. Como el navegador puede borrar esos datos, las herramientas que guardan trabajo dejan descargar una copia.
- **Lo guardado se valida al leerlo y tiene versión.** Si el dato está dañado, la herramienta arranca limpia en vez de romperse. Si es de una versión anterior, se migra.
- **Las cuentas se prueban sin navegador.** Como la lógica no depende de React, las más de 250 pruebas corren en segundos.
- **El PDF sale de la impresión del navegador.** Una hoja de estilos de impresión muestra el documento y oculta el formulario. No hace falta ninguna librería de PDF.
- **Los gráficos están hechos a mano en SVG.** Son tres tipos y una librería de gráficos pesaría más que todo el resto del sitio. Los de columnas y de línea se pueden leer con teclado y traen sus datos en una tabla.
- **El video y la cámara no salen del equipo.** La detección corre en el navegador con MediaPipe. Lo único que se descarga es el modelo, desde los servidores de Google, la primera vez.
- **Biome en vez de ESLint y Prettier.** Hace las dos cosas con una sola configuración y ya funciona con TypeScript 7.

## Agregar una herramienta

1. Crear `apps/<nombre>/` con la pantalla como `export default`.
2. Sacar las cuentas a un archivo aparte y escribirles pruebas.
3. Usar lo de `shared/` en vez de copiar: `Pagina`, `Tarjeta`, `Campo`, `Boton`, `useGuardadoLocal`, `formatearDinero`.
4. Agregarla en `src/herramientas.ts`. Con eso ya tiene ruta, aparece en el inicio y entra a las pruebas de punta a punta.
5. Escribir su `README.md` con el problema que resuelve y una captura.
6. `npm run check` en verde antes del commit.

Un cuidado con los nombres: dos archivos de la misma carpeta no pueden llamarse igual cambiando solo mayúsculas (`Gestos.tsx` y `gestos.ts`). En Linux son dos archivos; en Windows y en macOS son el mismo, y los imports se cruzan.

## Stack

React 19, TypeScript, Vite, React Router, Vitest, Playwright y Biome. MediaPipe para la detección de postura y de gestos. GitHub Actions corre tipos, lint, pruebas y build en cada push a `main` y en cada pull request.

---

Hecho por [Juan Vasquez](https://juanvasquez.vercel.app).
