import React from 'react';
import { Download } from 'lucide-react';

interface Props {
  onExport: () => void;
}

const ExportLogsButton: React.FC<Props> = ({ onExport }) => {
  return (
    <button
      onClick={onExport}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#FD993B] hover:bg-orange-500 text-white shadow-sm"
      title="Exportar logs como CSV"
    >
      <Download className="w-4 h-4" />
      Exportar logs
    </button>
  );
};

export default ExportLogsButton;