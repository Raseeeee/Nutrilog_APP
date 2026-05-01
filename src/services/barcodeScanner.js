// BrowserMultiFormatReader viene de @zxing/browser
// DecodeHintType y BarcodeFormat vienen de @zxing/library — paquetes separados
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

export function createBarcodeReader() {
  return new BrowserMultiFormatReader(HINTS)
}

export function normalizeBarcode(code) {
  const digits = code.replace(/\D/g, '')
  if (digits.length <= 8)  return digits.padStart(8,  '0')
  if (digits.length <= 12) return digits.padStart(13, '0')
  return digits
}
