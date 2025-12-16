import React from 'react';
import { cn } from '../lib/utils';

interface TruckMapVisualProps {
  clientes: (string | null)[];
  tipoVeiculo: string;
  compact?: boolean;
  statusBySlot?: ('Pendente' | 'Entregue' | 'Devolvida')[];
}

const TruckMapVisual: React.FC<TruckMapVisualProps> = ({ clientes, tipoVeiculo, compact = false, statusBySlot = [] }) => {
  const typeSlots: Record<string, number> = { 'BONGO': 3, 'DELIVERY': 6, '3/4': 8, 'TOCO': 12, 'TRUCK': 16, 'CARRETA': 26 };
  const count = typeSlots[tipoVeiculo] || Math.max(12, clientes.length);
  const slots = [...clientes];
  while (slots.length < count) slots.push(null);

  const getBgByStatus = (status?: 'Pendente' | 'Entregue' | 'Devolvida') => {
    if (status === 'Entregue') return 'bg-green-100';
    if (status === 'Devolvida') return 'bg-yellow-100';
    if (status === 'Pendente') return 'bg-red-100';
    return 'bg-white';
  };

  const sizeClass = compact ? "w-full max-w-[300px]" : "w-full max-w-[400px]";
  const bodyMinH = compact ? "min-h-[240px]" : "min-h-[300px]";

  const cols = 2;
  const rows = Math.ceil(count / cols);

  if (tipoVeiculo === 'BONGO') {
    const leftTopIdx = 0;
    const rightIdx = 1;
    const leftBottomIdx = 2;
    const leftTop = slots[leftTopIdx];
    const leftBottom = slots[leftBottomIdx];
    const rightSpan = slots[rightIdx];
    const leftTopStatus = statusBySlot[leftTopIdx] || 'Pendente';
    const leftBottomStatus = statusBySlot[leftBottomIdx] || 'Pendente';
    const rightStatus = statusBySlot[rightIdx] || 'Pendente';
    return (
      <div className={cn("bg-gray-200 rounded-xl p-4 border-4 border-gray-400 relative mx-auto", sizeClass)}>
        <div className="bg-gray-800 text-white text-center py-2 font-bold uppercase text-sm rounded-t-lg mb-2 shadow-md">Fundo do Baú</div>
        <div className={cn("bg-white border-2 border-gray-300", bodyMinH, "grid grid-cols-2 grid-rows-2")}>
          <div className={cn("border-r border-b border-gray-200 p-2 flex items-center justify-center relative", getBgByStatus(leftTopStatus))}>
            {leftTop ? <span className={cn("font-bold text-gray-800", compact ? "text-xs" : "text-sm")}>{leftTop}</span> : <span className="text-gray-300 text-xs italic">Vazio</span>}
            <span className="absolute left-1 bottom-1 text-[10px] text-gray-400 font-mono">3</span>
          </div>
          <div className={cn("row-span-2 p-2 flex items-center justify-center relative", getBgByStatus(rightStatus))}>
            {rightSpan ? <span className={cn("font-bold text-gray-800", compact ? "text-xs" : "text-sm")}>{rightSpan}</span> : <span className="text-gray-300 text-xs italic">Vazio</span>}
            <span className="absolute right-1 bottom-1 text-[10px] text-gray-400 font-mono">2</span>
          </div>
          <div className={cn("border-r border-t border-gray-200 p-2 flex items-center justify-center relative", getBgByStatus(leftBottomStatus))}>
            {leftBottom ? <span className={cn("font-bold text-gray-800", compact ? "text-xs" : "text-sm")}>{leftBottom}</span> : <span className="text-gray-300 text-xs italic">Vazio</span>}
            <span className="absolute left-1 bottom-1 text-[10px] text-gray-400 font-mono">1</span>
          </div>
        </div>
        <div className="bg-gray-400 text-gray-800 text-center py-2 font-bold uppercase text-sm rounded-b-lg mt-2 shadow-inner border-t border-gray-500">Portas do Baú</div>
        <div className="flex justify-between mt-1 px-4"><div className="w-12 h-6 bg-gray-800 rounded-b-xl"></div><div className="w-12 h-6 bg-gray-800 rounded-b-xl"></div></div>
      </div>
    );
  }

  return (
    <div className={cn("bg-gray-200 rounded-xl p-4 border-4 border-gray-400 relative mx-auto", sizeClass)}>
      <div className="bg-gray-800 text-white text-center py-2 font-bold uppercase text-sm rounded-t-lg mb-2 shadow-md">Fundo do Baú</div>
      <div className={cn("bg-white border-2 border-gray-300", bodyMinH, `grid grid-cols-2`, `grid-rows-${rows}`)}>
        {Array.from({ length: rows }).map((_, r) => {
          const leftArrIdx = r * 2;
          const rightArrIdx = r * 2 + 1;
          const displayBase = (rows - 1 - r) * 2;
          return (
            <React.Fragment key={r}>
              <div className={cn("border-r border-b last:border-b-0 border-gray-200 p-2 flex items-center justify-center relative", getBgByStatus(statusBySlot[leftArrIdx]))}>
                {slots[leftArrIdx] ? <span className={cn("font-bold text-gray-800", compact ? "text-xs" : "text-sm")}>{slots[leftArrIdx]}</span> : <span className="text-gray-300 text-xs italic">Vazio</span>}
                <span className="absolute left-1 bottom-1 text-[10px] text-gray-400 font-mono">{displayBase + 1}</span>
              </div>
              <div className={cn("border-b last:border-b-0 border-gray-200 p-2 flex items-center justify-center relative", getBgByStatus(statusBySlot[rightArrIdx]))}>
                {slots[rightArrIdx] ? <span className={cn("font-bold text-gray-800", compact ? "text-xs" : "text-sm")}>{slots[rightArrIdx]}</span> : <span className="text-gray-300 text-xs italic">Vazio</span>}
                <span className="absolute right-1 bottom-1 text-[10px] text-gray-400 font-mono">{displayBase + 2}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div className="bg-gray-400 text-gray-800 text-center py-2 font-bold uppercase text-sm rounded-b-lg mt-2 shadow-inner border-t border-gray-500">Portas do Baú</div>
      <div className="flex justify-between mt-1 px-4"><div className="w-12 h-6 bg-gray-800 rounded-b-xl"></div><div className="w-12 h-6 bg-gray-800 rounded-b-xl"></div></div>
    </div>
  );
};

export default TruckMapVisual;
