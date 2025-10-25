// src/auth/ui/FacialRegisterSection.tsx
import React from 'react';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useFaceCapture } from '../hook/useFaceCapture';

interface Props {
  status: 'idle' | 'ready' | 'capturing' | 'done';
  onStart: () => void;
  onFinish: () => void;
  displayName?: string;
}

const FacialRegisterSection: React.FC<Props> = ({ status, onStart, onFinish, displayName }) => {
  const { videoRef, overlayRef, faceReady, status: faceStatus } = useFaceCapture();

  const isCapturing = status === 'capturing';
  const isDone = status === 'done';

  const frameBorder = isDone
    ? 'border-green-500'
    : isCapturing
      ? 'border-blue-500'
      : 'border-transparent';

  return (
    <div className="space-y-6">
      {/* Encabezado contextual */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-gray-700" />
          <h4 className="text-sm font-semibold text-gray-800">
            Registro facial del usuario
          </h4>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            faceReady
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {faceReady ? (
            <>
              <CheckCircle className="w-4 h-4" /> Rostro detectado
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" /> {faceStatus || 'Esperando cámara'}
            </>
          )}
        </span>
      </div>

      {/* Contenedor principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vista de cámara */}
        <div className={`relative flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border-2 ${frameBorder} bg-[#EFEFEF]`}>
          {/* Círculo de cámara */}
          <div className="relative w-[340px] h-[340px] rounded-full overflow-hidden border-[3px] border-[#FD993B] shadow-[0_0_20px_rgba(253,153,59,0.6)] flex items-center justify-center">
            {/* VIDEO */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="object-cover w-full h-full"
              style={{ transform: 'scaleX(-1)' }}
            />
            {/* OVERLAY */}
            <canvas
              ref={overlayRef}
              className="absolute inset-0 object-cover w-full h-full pointer-events-none"
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>

          {/* Estado inferior */}
          <div className="absolute bottom-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm">
            {faceStatus}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Sigue estos pasos para completar el registro facial:
            </p>
            <ol className="mt-2 text-sm text-gray-700 list-decimal list-inside space-y-1">
              <li>Colócate frente a la cámara y centra tu rostro en el círculo.</li>
              <li>Presiona “Iniciar captura” cuando el sistema te detecte.</li>
              <li>Cuando aparezca “Rostro detectado”, podrás finalizar.</li>
            </ol>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Usuario</p>
            <p className="text-base font-semibold text-gray-800">
              {displayName || 'Nuevo usuario'}
            </p>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onStart}
              disabled={!faceReady || isCapturing}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                faceReady
                  ? 'bg-[#FD993B] text-white hover:brightness-110'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Iniciar captura
            </button>
            <button
              onClick={onFinish}
              disabled={!isDone}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                isDone
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Finalizar
            </button>
          </div>

          <div className="bg-orange-50 rounded-xl p-3 text-orange-800 text-sm border border-orange-200">
            Este registro es una simulación funcional: la cámara y detección facial están activas.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacialRegisterSection;
