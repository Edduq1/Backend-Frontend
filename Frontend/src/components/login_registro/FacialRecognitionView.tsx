// src/components/Dashboard/FacialRecognitionView.tsx
import React from 'react';
import { useFaceCapture } from '../../auth/hook/useFaceCapture'; 

interface FacialRecognitionViewProps {
  isLoading: boolean;
  onGoBack: () => void;
}

const FacialRecognitionView: React.FC<FacialRecognitionViewProps> = ({ isLoading, onGoBack }) => {
  const { videoRef, overlayRef, faceReady, status } = useFaceCapture();

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-white mb-3">Reconocimiento Facial</h2>
      <p className="text-gray-400 text-sm mb-5">Mire directamente a la cámara.</p>

      <div className="relative w-[320px] h-[320px] rounded-full overflow-hidden border-[3px] border-blue-500/60 shadow-[0_0_40px_rgba(59,130,246,0.3)] flex items-center justify-center mb-6">
        {/* VIDEO */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="object-cover w-full h-full"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* OVERLAY con máscara facial */}
        <canvas
          ref={overlayRef}
          className="absolute inset-0 object-cover w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Efectos visuales de animación */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-[2px] border-blue-400/50 rounded-full animate-pulse"></div>
          {/* Línea de escaneo animada */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/80 to-transparent animate-scan"></div>
        </div>

        <span className={`absolute bottom-5 text-sm font-medium bg-black/60 px-3 py-1 rounded-full ${
          isLoading 
            ? 'text-blue-300' 
            : faceReady 
              ? 'text-green-400' 
              : 'text-yellow-400'
        }`}>
          {isLoading ? 'Analizando identidad...' : status || 'Iniciando cámara...'}
        </span>
      </div>

      <button
        onClick={onGoBack}
        disabled={isLoading}
        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-lg transition"
      >
        {isLoading ? 'Reconociendo...' : 'Volver'}
      </button>
    </div>
  );
};

export default FacialRecognitionView;