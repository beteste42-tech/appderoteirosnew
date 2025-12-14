import React from 'react';
import { cn } from '../lib/utils';

interface TruckMapVisualProps {
  clientes: (string | null)[];
  tipoVeiculo: string;
  compact?: boolean;
}

const TruckMapVisual: React.FC<TruckMapVisualProps> = ({ clientes, tipoVeiculo, compact = false }) => {
  // Ajustar grid baseado no tipo (simulação simples)
  // O layout padrão da imagem é 2 colunas.
  
  // Preencher slots vazios se necessário para visualização
  const slots = [...clientes];
  // Garantir que temos slots suficientes para o desenho (min 12 para visual bonito)
  while(slots.length < 12) slots.push(null);

  // Inverter para mostrar "Fundo do Bau" no topo (primeiros indices visualmente no topo)
  // Mas na lógica de carregamento, geralmente o fundo é carregado primeiro (entregas ultimas).
  // Vamos seguir a imagem: Fundo do Bau em cima.
  
  // Dividir em pares para as linhas
  const rows = [];
  for (let i = 0; i < slots.length; i += 2) {
    rows.push([slots[i], slots[i+1]]);
  }

  // Se for visualização de caminhão, queremos que pareça um baú
  return (
    <div className={cn("bg-gray-200 rounded-xl p-4 border-4 border-gray-400 relative mx-auto", compact ? "w-full max-w-[300px]" : "w-full max-w-[400px]")}>
      {/* Cabine (Top visual representation if needed, but image shows rear view) */}
      
      {/* Header Fundo do Bau */}
      <div className="bg-gray-800 text-white text-center py-2 font-bold uppercase text-sm rounded-t-lg mb-2 shadow-md">
        Fundo do Baú
      </div>

      {/* Grid de Carga */}
      <div className="bg-white border-2 border-gray-300 min-h-[300px] flex flex-col">
        {rows.map((row, idx) => (
          <div key={idx} className="flex border-b border-gray-200 flex-1 min-h-[60px]">
            {/* Esquerda */}
            <div className="w-1/2 border-r border-gray-200 p-2 flex flex-col justify-center items-center relative group">
              {row[0] ? (
                <>
                  <span className={cn("font-bold text-gray-800 text-center leading-tight", compact ? "text-xs" : "text-sm")}>{row[0]}</span>
                  <div className="absolute bottom-1 right-1 opacity-50">
                    <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                  </div>
                </>
              ) : (
                <span className="text-gray-300 text-xs italic">Vazio</span>
              )}
              <span className="absolute left-1 top-1 text-[10px] text-gray-400 font-mono">{idx * 2 + 1}</span>
            </div>

            {/* Direita */}
            <div className="w-1/2 p-2 flex flex-col justify-center items-center relative group">
               {row[1] ? (
                <>
                  <span className={cn("font-bold text-gray-800 text-center leading-tight", compact ? "text-xs" : "text-sm")}>{row[1]}</span>
                  <div className="absolute bottom-1 right-1 opacity-50">
                    <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                  </div>
                </>
              ) : (
                <span className="text-gray-300 text-xs italic">Vazio</span>
              )}
              <span className="absolute right-1 top-1 text-[10px] text-gray-400 font-mono">{idx * 2 + 2}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Portas */}
      <div className="bg-gray-400 text-gray-800 text-center py-2 font-bold uppercase text-sm rounded-b-lg mt-2 shadow-inner border-t border-gray-500">
        Portas do Baú
      </div>

      {/* Rodas / Para-choque visual */}
      <div className="flex justify-between mt-1 px-4">
        <div className="w-12 h-6 bg-gray-800 rounded-b-xl"></div>
        <div className="w-12 h-6 bg-gray-800 rounded-b-xl"></div>
      </div>
    </div>
  );
};

export default TruckMapVisual;
