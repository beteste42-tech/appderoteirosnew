import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
      <Construction size={64} className="mb-4 text-yellow-500" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-lg">Em Desenvolvimento</p>
      <p className="text-sm mt-2">Depois oriento a TI sobre o que fazer.</p>
    </div>
  );
};

export default Placeholder;
