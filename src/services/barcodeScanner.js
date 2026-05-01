/**
 * Escáner de código de barras usando @zxing/browser (cámara en vivo).
 * Mucho más fiable que decodificar una foto estática.
 * Instalar: npm install @zxing/browser @zxing/library
 */
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType, BarcodeFormat } from '@zxing/library'

const HINTS = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.ITF,
    BarcodeFormat.QR_CODE,
  ]],
  [DecodeHintType.TRY_HARDER, true],
])

// ... el resto del código igual

/**
 * Devuelve una instancia nueva del lector.
 * Llamar .reset() cuando ya no se necesite.
 */
export function createBarcodeReader() {
  return new BrowserMultiFormatReader(HINTS)
}

/**
 * Normaliza el código según spec OpenFoodFacts:
 * ≤8 dígitos → pad a 8, 9-12 → pad a 13
 */
export function normalizeBarcode(code) {
  const digits = code.replace(/\D/g, '')
  if (digits.length <= 8)  return digits.padStart(8,  '0')
  if (digits.length <= 12) return digits.padStart(13, '0')
  return digits
}
