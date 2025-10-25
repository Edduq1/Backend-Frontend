// src/auth/ui/LoginScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
// Importaciones de tus nuevos componentes
import Notification from '../../components/common/Notification';

import InitialView from '../../components/login_registro/InitialView';
import FacialRecognitionView from '../../components/login_registro/FacialRecognitionView';
import ManualDniView from '../../components/login_registro/ManualDniView';
import ManualCodeView from '../../components/login_registro/ManualCodeView';
import SuccessView from '../../components/login_registro/SuccessView';


// Tipos de pasos del flujo
type LoginStep = 'INITIAL' | 'FACIAL_RECOGNITION' | 'MANUAL_DNI' | 'MANUAL_CODE' | 'SUCCESS';

interface LoginScreenProps {
  onLogin:(username: string, password: string) => Promise<boolean>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<LoginStep>('INITIAL');
  const [dni, setDni] = useState('');
  const [code, setCode] = useState(['', '', '', '', '','']);
  // El useRef es importante mantenerlo aquí ya que es lógica de la pantalla
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  // Mostrar notificación temporal
  const showNotification = (message: string, type?: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  // Efecto para enfocar el primer campo de código
  useEffect(() => {
    if (step === 'MANUAL_CODE') {
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } else if (step === 'SUCCESS') {
       // Redirección automática al Dashboard
       setTimeout(() => {
         onLogin("test_user", "test_pass");
       }, 2500);
    }
  }, [step, onLogin]);


  // --- MANEJADORES DE LÓGICA ---

  const startFacialRecognition = () => {
    const cameraFails = Math.random() > 0.92;
    setStep('FACIAL_RECOGNITION');
    setIsLoading(true);

    // SIMULACIÓN: Lógica de reconocimiento
    setTimeout(() => {
      setIsLoading(false);
      if (cameraFails) {
        showNotification('❌ Error al acceder a la cámara. Cambiando a acceso manual...', 'error');
        setStep('MANUAL_DNI');
      } else {
        showNotification('✅ Reconocimiento facial exitoso', 'success');
        setTimeout(() => setStep('SUCCESS'), 1500);
      }
    }, 3000);
  };

  const handleDniSubmit = () => {
    if (dni.length !== 8) {
      showNotification('El DNI debe tener exactamente 8 dígitos', 'error');
      return;
    }
    showNotification(`📧 Enviando código a correo asociado al DNI ${dni}`, 'info');
    setStep('MANUAL_CODE');
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const value = e.target.value.slice(-1);
    const newCode = [...code];

    // Permitir borrar (backspace)
    if (value === '') {
        newCode[i] = '';
        setCode(newCode);
        if (i > 0) codeRefs.current[i - 1]?.focus();
        return;
    }

    // Solo permitir números
    if (/\D/.test(value)) return;

    newCode[i] = value;
    setCode(newCode);

    // Auto-avance
    if (value && i < 5) codeRefs.current[i + 1]?.focus();

    // Auto-validación si se completa el último dígito
    if (i === 5 && newCode.every(d => d !== '')) {
        validateCode(newCode.join(''));
    }
  };

  const validateCode = (enteredCode: string = code.join('')) => {
    setIsLoading(true);

    if (enteredCode.length < 6) {
      showNotification('Ingrese los 6 dígitos del código', 'error');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
        setIsLoading(false);
        if (enteredCode === '123456') { // Código de ejemplo
            showNotification('✅ Código correcto', 'success');
            setTimeout(() => setStep('SUCCESS'), 1000);
        } else {
            showNotification('❌ Código incorrecto. Intente de nuevo', 'error');
            setCode(['', '', '', '', '','']);
            codeRefs.current[0]?.focus();
        }
    }, 1500);
  };

  // --- RENDERIZADO CONDICIONAL DE VISTAS ---
  const renderStep = () => {
    switch (step) {
      case 'INITIAL':
        return (
          <InitialView
            onStartFacialRecognition={startFacialRecognition}
            onNavigateToManualDNI={() => setStep('MANUAL_DNI')}
          />
        );
      case 'FACIAL_RECOGNITION':
        return (
          <FacialRecognitionView
            isLoading={isLoading}
            onGoBack={() => setStep('INITIAL')}
          />
        );
      case 'MANUAL_DNI':
        return (
          <ManualDniView
            dni={dni}
            setDni={setDni}
            onSubmit={handleDniSubmit}
            onGoBack={() => setStep('INITIAL')}
          />
        );
      case 'MANUAL_CODE':
        return (
          <ManualCodeView
            code={code}
            codeRefs={codeRefs as React.RefObject<Array<HTMLInputElement | null>>} // Casteo para compatibilidad
            handleCodeChange={handleCodeChange}
            validateCode={() => validateCode()}
            isLoading={isLoading}
            onGoBack={() => setStep('MANUAL_DNI')}
          />
        );
      case 'SUCCESS':
        return <SuccessView />;
      default:
        return null;
    }
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #000000 100%)' }}
    >
      {notification && <Notification {...notification} />}

      <div
        className="w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl overflow-hidden border border-blue-600/40"
        style={{ boxShadow: '0 0 40px rgba(59,130,246,0.4)' }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-lg font-semibold text-white">Portal de Autenticación</span>
          <div className="p-2 rounded-full bg-blue-600/30">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 9V7a5 5 0 0110 0v2h2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2h2zm8-2v2H7V7a3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* CONTENIDO (El renderizado condicional de las VISTAS) */}
        <div className="p-6 text-center">
          {renderStep()}
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-700 text-gray-500 text-xs p-4 text-center">
          <p>🔒 Conexión segura y validada</p>
          <p>Actividad monitoreada</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;