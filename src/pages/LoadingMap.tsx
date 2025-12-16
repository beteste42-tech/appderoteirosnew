import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, FileDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { exportElementToPdf } from '../lib/pdf';

const LoadingMap = () => {
  const { veiculosTypes } = useApp();
  const [selectedVehicleType, setSelectedVehicleType] = useState('3/4');
  
  // State for interactive grid
  // 14 slots max for largest vehicle in this example
  const [slots, setSlots] = useState<(string | null)[]>(Array(14).fill(null));

  const handleSlotClick = (index: number) => {
    // Simple prompt for prototype purposes. In real app, would be a modal or drag-drop.
    const clientName = prompt("Selecione um cliente para este espaço (Digite o nome):");
    if (clientName !== null) {
      const newSlots = [...slots];
      newSlots[index] = clientName === "" ? null : clientName;
      setSlots(newSlots);
    }
  };

  const clearSlots = () => setSlots(Array(14).fill(null));

  // Determine grid size based on vehicle
  // @ts-ignore
  const vehicleConfig = veiculosTypes[selectedVehicleType] || { layout: '2x4' };
  const rowsCount = parseInt(vehicleConfig.layout.split('x')[1]);
  
  // Generate rows for display
  const displayRows = [];
  for(let i=0; i < rowsCount; i++) {
    displayRows.push([i*2, i*2+1]);
  }

  const printRef = useRef<HTMLDivElement>(null);
  const handleExportPdf = async () => {
    if (!printRef.current) return;
    const info = [
      { label: 'Tipo de Veículo', value: selectedVehicleType },
    ];
    await exportElementToPdf(printRef.current, {
      fileName: `Mapa_${selectedVehicleType}.pdf`,
      title: 'Roteiriza GDM — Mapa de Carregamento',
      subtitle: selectedVehicleType,
      info,
      logoUrl: 'https://i.ibb.co/Hp2fcxR1/grupo-docemel-logo-square.png'
    });
  };
  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mapa de Carregamento Interativo</h1>
        <button onClick={clearSlots} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
          Limpar Mapa
        </button>
      </div>

      <div ref={printRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
        
        <div className="mb-8 max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selecione o Tipo de Veículo</label>
          <select 
            value={selectedVehicleType}
            onChange={(e) => {
              setSelectedVehicleType(e.target.value);
              clearSlots();
            }}
            className="w-full border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            {Object.keys(veiculosTypes).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[500px] bg-gray-100 dark:bg-slate-900 p-8 rounded-3xl border-4 border-gray-300 dark:border-slate-600 relative">
            
            {/* Truck Header */}
            <div className="bg-gray-800 text-white text-center py-3 font-bold uppercase tracking-wider rounded-t-lg mb-1 shadow-lg">
              Fundo do Baú
            </div>

            {/* Truck Body Grid */}
            <div className="bg-white dark:bg-slate-800 border-x-4 border-gray-300 dark:border-slate-600 min-h-[400px] shadow-inner">
              {displayRows.map((row, rIdx) => (
                <div key={rIdx} className="flex border-b-2 border-dashed border-gray-200 dark:border-slate-700 h-24">
                  {/* Left Slot */}
                  <div 
                    onClick={() => handleSlotClick(row[0])}
                    className="w-1/2 border-r-2 border-dashed border-gray-200 dark:border-slate-700 p-2 flex items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors relative group"
                  >
                    {slots[row[0]] ? (
                      <div className="text-center">
                        <span className="font-bold text-gray-800 dark:text-white text-sm block leading-tight">{slots[row[0]]}</span>
                        <span className="text-xs text-primary dark:text-green-400 font-medium">Ocupado</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs font-medium group-hover:text-primary dark:group-hover:text-green-400">Clique para adicionar</span>
                    )}
                    <span className="absolute top-1 left-2 text-[10px] text-gray-400 font-mono">{row[0] + 1}</span>
                  </div>

                  {/* Right Slot */}
                  <div 
                    onClick={() => handleSlotClick(row[1])}
                    className="w-1/2 p-2 flex items-center justify-center cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors relative group"
                  >
                     {slots[row[1]] ? (
                      <div className="text-center">
                        <span className="font-bold text-gray-800 dark:text-white text-sm block leading-tight">{slots[row[1]]}</span>
                        <span className="text-xs text-primary dark:text-green-400 font-medium">Ocupado</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-xs font-medium group-hover:text-primary dark:group-hover:text-green-400">Clique para adicionar</span>
                    )}
                    <span className="absolute top-1 right-2 text-[10px] text-gray-400 font-mono">{row[1] + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Truck Footer */}
            <div className="bg-gray-400 dark:bg-slate-600 text-gray-900 dark:text-white text-center py-3 font-bold uppercase tracking-wider rounded-b-lg mt-1 border-t-4 border-gray-500 dark:border-slate-500 shadow-lg">
              Portas do Baú
            </div>

            {/* Wheels */}
            <div className="absolute -bottom-6 left-10 w-16 h-8 bg-black rounded-b-2xl"></div>
            <div className="absolute -bottom-6 right-10 w-16 h-8 bg-black rounded-b-2xl"></div>

          </div>
        </div>
        
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
          Clique nos quadrantes para atribuir um cliente à posição no baú.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleExportPdf}
            className="bg-primary text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 hover:opacity-90 transition"
          >
            <FileDown size={16} /> Gerar PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoadingMap;
