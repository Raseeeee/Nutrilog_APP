/**
 * Lee códigos de barras de una imagen usando @zxing/library.
 * No consume cuota de Gemini. Funciona 100% en el navegador.
 * 
 * Instalación: npm install @zxing/library
 */
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'

let reader = null

function getReader() {
  if (!reader) {
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
    ])
    hints.set(DecodeHintType.TRY_HARDER, true)
    reader = new BrowserMultiFormatReader(hints)
  }
  return reader
}

/**
 * Lee el código de barras de un File de imagen.
 * @param {File} imageFile
 * @returns {Promise<string|null>} código o null si no se encuentra
 */
export async function readBarcodeFromFile(imageFile) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(imageFile)
    const img = new Image()
    img.onload = () => {
      try {
        const result = getReader().decodeFromImageElement(img)
        URL.revokeObjectURL(url)
        resolve(result?.getText() || null)
      } catch {
        URL.revokeObjectURL(url)
        resolve(null)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}
