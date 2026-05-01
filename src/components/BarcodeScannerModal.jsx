import { useEffect, useRef, useState } from 'react'
import { createBarcodeReader, normalizeBarcode } from '../services/barcodeScanner'

export default function BarcodeScannerModal({ onDetected, onClose }) {
  const videoRef   = useRef()
  const readerRef  = useRef()
  const controlRef = useRef()
  const [status, setStatus]   = useState('Apuntando al código de barras…')
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    let cancelled = false
    readerRef.current = createBarcodeReader()

    async function start() {
      try {
        // Preferir cámara trasera
        const devices = await readerRef.current.constructor.listVideoInputDevices()
        const rear = devices.find(d =>
          /back|rear|environment/i.test(d.label)
        ) || devices[devices.length - 1]

        const deviceId = rear?.deviceId

        controlRef.current = await readerRef.current.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (cancelled) return
            if (result) {
              const code = normalizeBarcode(result.getText())
              setDetected(true)
              setStatus(`✅ Código detectado: ${code}`)
              // Vibrar si disponible
              if (navigator.vibrate) navigator.vibrate(100)
              setTimeout(() => {
                if (!cancelled) onDetected(code)
              }, 600)
            }
          }
        )
      } catch (e) {
        if (!cancelled) {
          setStatus('❌ No se pudo acceder a la cámara. Comprueba los permisos.')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      try { controlRef.current?.stop() } catch {}
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3 bg-black">
        <h2 className="text-white font-medium text-base">Escanear código de barras</h2>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-2xl leading-none px-2"
        >×</button>
      </div>

      {/* Visor de cámara */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Overlay oscuro con ventana central */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Sombra arriba */}
          <div className="absolute inset-x-0 top-0 h-[28%] bg-black/60" />
          {/* Sombra abajo */}
          <div className="absolute inset-x-0 bottom-0 h-[28%] bg-black/60" />
          {/* Sombra izquierda */}
          <div className="absolute left-0 top-[28%] bottom-[28%] w-[8%] bg-black/60" />
          {/* Sombra derecha */}
          <div className="absolute right-0 top-[28%] bottom-[28%] w-[8%] bg-black/60" />

          {/* Marco de escaneo */}
          <div
            className={`relative border-2 rounded-lg transition-colors duration-300 ${
              detected ? 'border-[#639922]' : 'border-white'
            }`}
            style={{ width: '84%', height: '44%' }}
          >
            {/* Esquinas decorativas */}
            {[
              'top-0 left-0 border-t-4 border-l-4 rounded-tl-lg',
              'top-0 right-0 border-t-4 border-r-4 rounded-tr-lg',
              'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg',
              'bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg',
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-5 h-5 ${detected ? 'border-[#639922]' : 'border-white'} ${cls}`}
              />
            ))}

            {/* Línea de escaneo animada */}
            {!detected && (
              <div
                className="absolute left-2 right-2 h-0.5 bg-[#639922]/80"
                style={{ animation: 'scanline 2s ease-in-out infinite' }}
              />
            )}

            {detected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl">✅</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-black px-4 py-4 pb-safe text-center">
        <p className="text-white/80 text-sm">{status}</p>
        <p className="text-white/40 text-xs mt-1">
          Mantén el código de barras centrado y bien iluminado
        </p>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 10%; }
          50%  { top: 85%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  )
}
