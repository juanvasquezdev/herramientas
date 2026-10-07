# Herramientas

Herramientas pequeñas para negocios y deporte. Cada una resuelve una tarea concreta, corre en el navegador, no pide cuenta y guarda los datos en el equipo de quien la usa.

Todas viven en un solo sitio: una página de inicio y una ruta por herramienta.

**En vivo:** https://juanvasquez-herramientas.vercel.app

## Qué hay

| Herramienta | Para qué sirve | Código |
|---|---|---|
| **Cotizador** | Armar una cotización con ítems e impuesto y exportarla en PDF. Recuerda los datos de la empresa y lleva el consecutivo. | [`apps/cotizador`](apps/cotizador) |

Vienen en camino, una a la vez: calculadora de precios y rentabilidad, y análisis biomecánico de salto alto a partir de un video.

## Correrlo

Necesita Node 22.22 o más reciente.

```bash
npm install
npm run dev      # abre el sitio en http://localhost:5173
```

Otros comandos:

```bash
npm test             # pruebas de la lógica
npm run typecheck    # revisión de tipos
npm run build        # versión de producción en dist/
npm run check        # las tres anteriores seguidas; es lo mismo que corre el CI
```

## Cómo está organizado

```
├── apps/                  una carpeta por herramienta
│   └── cotizador/
├── shared/                lo que usan varias herramientas
│   ├── ui.tsx, ui.css     tarjeta, campo, botón y los colores del sitio
│   ├── dinero.ts          pasar texto a número, redondear y dar formato
│   ├── fecha.ts           fecha de hoy y fecha escrita en español
│   ├── almacen.ts         leer y guardar en el navegador
│   ├── useGuardadoLocal.ts  un useState que no se pierde al recargar
│   ├── imprimir.ts        abrir la impresión con nombre de archivo
│   └── id.ts              ids para las filas de las listas
└── src/                   el cascarón del sitio
    ├── herramientas.ts    el registro: de aquí salen las rutas y el inicio
    ├── Inicio.tsx
    └── MarcoHerramienta.tsx
```

Dentro de cada herramienta el código se parte igual:

- **La pantalla** (`Cotizador.tsx`): formulario y estado. No hace cuentas.
- **La lógica** (`calculo.ts`, `cotizacion.ts`): funciones puras, sin React. Es lo que llevan las pruebas.
- **Los estilos** (`*.module.css`): solo los de esa herramienta.

## Decisiones

- **Un solo sitio y no un proyecto por herramienta.** Se instala y se despliega una vez, y el código repetido (formato de plata, guardado, botones) existe en un solo lugar.
- **Cada herramienta se carga cuando se abre.** El registro usa `lazy()`, así la página de inicio no baja el código de las demás.
- **Los datos se quedan en el navegador.** No hay servidor ni base de datos. Para una herramienta que usa una sola persona en su equipo es suficiente y no hay nada que proteger ni que pagar.
- **Lo guardado se valida al leerlo.** Si el dato está dañado o es de una versión vieja, la herramienta arranca limpia en vez de romperse.
- **Las cuentas se prueban sin navegador.** Como la lógica no depende de React, las pruebas corren en menos de dos segundos.
- **El PDF sale de la impresión del navegador.** Una hoja de estilos de impresión muestra el documento y oculta el formulario. No hace falta ninguna librería de PDF.

## Agregar una herramienta

1. Crear `apps/<nombre>/` con la pantalla como `export default`.
2. Sacar las cuentas a un archivo aparte y escribirles pruebas.
3. Usar lo de `shared/` en vez de copiar: `Tarjeta`, `Campo`, `Boton`, `useGuardadoLocal`, `formatearDinero`.
4. Agregarla en `src/herramientas.ts`.
5. Escribir su `README.md` con el problema que resuelve y una captura.
6. `npm run check` en verde antes del commit.

## Stack

React 19, TypeScript, Vite, React Router y Vitest. GitHub Actions corre tipos, pruebas y build en cada push a `main` y en cada pull request.

---

Hecho por [Juan Vasquez](https://juanvasquez.vercel.app).
