import React from 'react';
import { Lock } from 'lucide-react';

interface Props {
  message?: string;
}

const RestrictedViewNotice: React.FC<Props> = ({ message = 'Acceso restringido' }) => {
  return (
    <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-700" title={message}>
        <Lock className="w-5 h-5" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default RestrictedViewNotice;