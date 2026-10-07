import cargador from '@mediapipe/tasks-vision/vision_wasm_internal.js?url'
import binario from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url'
import cargadorSinSimd from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js?url'
import binarioSinSimd from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm?url'

/**
 * Carga MediaPipe Tasks Vision, la librería de Google que detecta personas y manos en el
 * navegador. La usan el análisis de salto y el control por gestos.
 *
 * - Se importa con import() para que solo se descargue cuando alguien abre una de esas dos
 *   herramientas y la usa; el resto del sitio no la carga.
 * - El programa (.wasm) sale del paquete de npm y se publica junto con el sitio, con la
 *   versión fijada en package-lock.json. No depende de un CDN.
 * - Todo corre en el equipo de la persona: ni el video ni la cámara salen de ahí.
 */
export async function cargarVision() {
  const vision = await import('@mediapipe/tasks-vision')
  // Casi todos los navegadores actuales tienen SIMD (instrucciones que aceleran el cálculo).
  // Para los que no, hay una versión más lenta del mismo programa.
  const conSimd = await vision.FilesetResolver.isSimdSupported()
  const archivos = conSimd
    ? { wasmLoaderPath: cargador, wasmBinaryPath: binario }
    : { wasmLoaderPath: cargadorSinSimd, wasmBinaryPath: binarioSinSimd }
  return { vision, archivos }
}
