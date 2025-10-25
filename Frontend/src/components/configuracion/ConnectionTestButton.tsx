import React, { useState } from 'react';
import { PlugZap, Loader2 } from 'lucide-react';

interface Props {
  onTest: () => Promise<void> | void;
}

const ConnectionTestButton: React.FC<Props> = ({ onTest }) => {
  const [running, setRunning] = useState(false);

  const handleClick = async () => {
    if (running) return;
    setRunning(true);
    await Promise.resolve(onTest());
    setTimeout(() => setRunning(false), 300); // pequeña pausa
  };

  return (
    <button
      onClick={handleClick}
      disabled={running}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${running ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-800 hover:bg-orange-50'} border-orange-200`}
      title="Probar conexión a la base de datos"
    >
      {running ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <PlugZap className="w-4 h-4 text-[#FD993B]" />
      )}
      Probar conexión
    </button>
  );
};

export default ConnectionTestButton;