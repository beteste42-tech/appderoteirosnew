import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import { Filter, FileDown, LayoutDashboard, Edit2, Save, X } from 'lucide-react';
import { exportElementsToPdf } from '../lib/pdf';
import { cn } from '../lib/utils';
import TruckMapVisual from '../components/TruckMapVisual';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente de cliente arrastável
const SortableCliente = ({ id, cliente, idx, rotaId, onEdit, isEditing, onSave, onCancel, status, comentario }: {
          id: string;
          cliente: string;
          idx: number;
          rotaId: string;
          onEdit: () => void;
          isEditing: boolean;
          onSave: (novoCliente: string) => void;
          onCancel: () => void;
          status: string;
          comentario: string;
        }) => {
          const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
          } = useSortable({ id });

          const [editValue, setEditValue] = useState(cliente);

          const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
          };

          return (
            <div
              ref={setNodeRef}
              style={style}
              className={cn(
                "border-b dark:border-slate-700 transition-colors",
                isDragging && "bg-gray-50 dark:bg-slate-700"
              )}
            >
              <div className="px-6 py-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 flex items-center gap-2">
                    <div className="cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                        <div className="w-4 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                        <div className="w-4 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full absolute mt-1"></div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">{idx + 1}</div>
                  </div>
                  <div className="col-span-8">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => onSave(editValue)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => {
                            onCancel();
                            setEditValue(cliente);
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {cliente}
                          {comentario ? (
                            <>
                              {comentario
                                .split('\n')
                                .filter(Boolean)
                                .map((line, i) => (
                                  <div key={i} className="mt-1 text-xs italic text-gray-400 dark:text-gray-300">
                                    {line}
                                  </div>
                                ))}
                            </>
                          ) : null}
                        </div>
                        <button
                          onClick={onEdit}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 ml-2"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center justify-center",
                      status === 'Entregue' ? "bg-green-100 text-green-800 border-green-200"
                      : status === 'Devolvida' ? "bg-purple-100 text-purple-800 border-purple-200"
                      : "bg-red-100 text-red-800 border-red-200"
                    )}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        };

const Resumo = () => {
  const { rotas, clientes, fretistas, motoristas, veiculos, regioes, theme, updateRota } = useApp();
  const initialFilters = { search: '', dataEntrega: '', fretista: '', motorista: '', placa: '', regiao: '', cliente: '', rede: '', uf: '', vendedor: '', cidade: '' };
  const [filters, setFilters] = useState(initialFilters);
  const clearFilters = () => setFilters(initialFilters);

  // Estados para edição
  const [editingRota, setEditingRota] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<any>({});
  const [editingCliente, setEditingCliente] = useState<string | null>(null);

  // Estados para drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedOverRota, setDraggedOverRota] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const clienteByNome = useMemo(() => {
    const map = new Map<string, typeof clientes[number]>();
    clientes.forEach(c => map.set(c.nome, c));
    return map;
  }, [clientes]);

  const filteredRotas = useMemo(() => {
    return rotas.filter(rota => {
      const matchSearch = filters.search === '' || Object.values(rota).some(val => String(val).toLowerCase().includes(filters.search.toLowerCase()));
      const matchData = !filters.dataEntrega || rota.dataEntrega === filters.dataEntrega;
      const matchFretista = !filters.fretista || rota.fretista === filters.fretista;
      const matchMotorista = !filters.motorista || rota.motorista === filters.motorista;
      const matchPlaca = !filters.placa || rota.placa === filters.placa;
      const matchRegiao = !filters.regiao || rota.regiao === filters.regiao;
      const matchCliente = !filters.cliente || rota.clientes.includes(filters.cliente);
      const clienteObjs = rota.clientes.filter(Boolean).map(n => clienteByNome.get(n as string)).filter(Boolean) as any[];
      const matchRede = !filters.rede || clienteObjs.some(c => c.rede === filters.rede);
      const matchUf = !filters.uf || clienteObjs.some(c => c.uf === filters.uf);
      const matchVendedor = !filters.vendedor || clienteObjs.some(c => c.vendedor === filters.vendedor);
      const matchCidade = !filters.cidade || clienteObjs.some(c => c.cidade === filters.cidade);
      return matchSearch && matchData && matchFretista && matchMotorista && matchPlaca && matchRegiao && matchCliente && matchRede && matchUf && matchVendedor && matchCidade;
    });
  }, [rotas, filters, clienteByNome]);

  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#475569';
  const uniquePlacas = Array.from(new Set(veiculos.map(v => v.placa)));
  const uniqueRedes = Array.from(new Set(clientes.map(c => c.rede).filter(Boolean)));
  const uniqueUFs = Array.from(new Set(clientes.map(c => c.uf).filter(Boolean)));
  const uniqueVendedores = Array.from(new Set(clientes.map(c => c.vendedor).filter(Boolean)));
  const uniqueCidades = Array.from(new Set(clientes.map(c => c.cidade).filter(Boolean)));

  const refsMap = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Funções de edição
  const handleEditRota = (rotaId: string) => {
    const rota = rotas.find(r => r.id === rotaId);
    if (rota) {
      setEditingRota(rotaId);
      setEditingFields({
        dataEntrega: rota.dataEntrega,
        regiao: rota.regiao,
        numeroCarga: rota.numeroCarga,
        fretista: rota.fretista,
        motorista: rota.motorista,
        placa: rota.placa,
        tipoVeiculo: rota.tipoVeiculo,
        pesoCarga: rota.pesoCarga,
      });
    }
  };

  const handleSaveRota = async () => {
    if (editingRota && updateRota) {
      await updateRota(editingRota, editingFields);
      setEditingRota(null);
      setEditingFields({});
    }
  };

  const handleCancelEditRota = () => {
    setEditingRota(null);
    setEditingFields({});
  };

  const handleEditCliente = (rotaId: string, clienteIdx: number, cliente: string) => {
    setEditingCliente(`${rotaId}-${clienteIdx}`);
  };

  const handleSaveCliente = async (rotaId: string, clienteIdx: number, novoCliente: string) => {
    const rota = rotas.find(r => r.id === rotaId);
    if (rota && updateRota) {
      const novosClientes = [...rota.clientes];
      novosClientes[clienteIdx] = novoCliente;
      await updateRota(rotaId, { clientes: novosClientes });
    }
    setEditingCliente(null);
  };

  const handleCancelEditCliente = () => {
    setEditingCliente(null);
  };

  // Funções de drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setDraggedOverRota(over.id as string);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setDraggedOverRota(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Parse IDs para obter rota e índice
    const [activeRotaId, activeIdx] = activeId.split('-');
    const [overRotaId, overIdx] = overId.split('-');

    if (activeRotaId === overRotaId) {
      // Mesma rota - reordenar dentro da rota
      const rota = rotas.find(r => r.id === activeRotaId);
      if (rota && updateRota) {
        const activeIndex = parseInt(activeIdx);
        const overIndex = parseInt(overIdx);
        const novosClientes = arrayMove(rota.clientes, activeIndex, overIndex);
        
        // Também mover os status e comentários correspondentes
        const novosStatus = arrayMove(rota.entregaStatusByIndex || [], activeIndex, overIndex);
        const novosComentarios = arrayMove(rota.entregaComentarioByIndex || [], activeIndex, overIndex);
        
        await updateRota(activeRotaId, {
          clientes: novosClientes,
          entregaStatusByIndex: novosStatus,
          entregaComentarioByIndex: novosComentarios,
        });
      }
    } else {
      // Mover entre rotas diferentes
      const activeRota = rotas.find(r => r.id === activeRotaId);
      const overRota = rotas.find(r => r.id === overRotaId);
      
      if (activeRota && overRota && updateRota) {
        const activeIndex = parseInt(activeIdx);
        const overIndex = parseInt(overIdx);
        
        // Remover cliente da rota de origem
        const novosClientesOrigem = [...activeRota.clientes];
        const clienteMovido = novosClientesOrigem.splice(activeIndex, 1)[0];
        
        const novosStatusOrigem = [...(activeRota.entregaStatusByIndex || [])];
        const statusMovido = novosStatusOrigem.splice(activeIndex, 1)[0];
        
        const novosComentariosOrigem = [...(activeRota.entregaComentarioByIndex || [])];
        const comentarioMovido = novosComentariosOrigem.splice(activeIndex, 1)[0];
        
        // Adicionar cliente na rota de destino
        const novosClientesDestino = [...overRota.clientes];
        novosClientesDestino.splice(overIndex, 0, clienteMovido);
        
        const novosStatusDestino = [...(overRota.entregaStatusByIndex || [])];
        novosStatusDestino.splice(overIndex, 0, statusMovido);
        
        const novosComentariosDestino = [...(overRota.entregaComentarioByIndex || [])];
        novosComentariosDestino.splice(overIndex, 0, comentarioMovido);
        
        // Atualizar peso das rotas
        const clienteInfo = clienteByNome.get(clienteMovido);
        const pesoCliente = clienteInfo?.pesaMedia || 0;
        
        // Atualizar ambas as rotas
        await updateRota(activeRotaId, {
          clientes: novosClientesOrigem,
          entregaStatusByIndex: novosStatusOrigem,
          entregaComentarioByIndex: novosComentariosOrigem,
          pesoCarga: Math.max(0, activeRota.pesoCarga - pesoCliente),
        });
        
        await updateRota(overRotaId, {
          clientes: novosClientesDestino,
          entregaStatusByIndex: novosStatusDestino,
          entregaComentarioByIndex: novosComentariosDestino,
          pesoCarga: overRota.pesoCarga + pesoCliente,
        });
      }
    }

    setActiveId(null);
    setDraggedOverRota(null);
  };

  const handleExportAllPdf = async () => {
    const elements = filteredRotas.map(r => refsMap.current[r.id]).filter((el): el is HTMLDivElement => !!el);
    if (elements.length) {
      await exportElementsToPdf(elements, {
        fileName: `Resumo_${filters.dataEntrega || 'rotas'}.pdf`,
        title: 'Roteiriza GDM — Resumo',
        subtitle: 'Rotas filtradas'
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
        <PageHeader 
          title="Resumo de Rotas" 
          description="Listagem detalhada de todas as rotas conforme filtros selecionados. Arraste os clientes para reordenar ou mover entre rotas."
          icon={LayoutDashboard}
        />

      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            Filtros Avançados
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full transition-colors">
              Limpar
            </button>
            <button onClick={handleExportAllPdf} className="text-sm text-white bg-primary px-3 py-1 rounded-full flex items-center gap-2">
              <FileDown size={14} /> Gerar PDF (Todos)
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <input type="text" placeholder="Pesquisa Dinâmica..." className="w-full p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          <input type="date" className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.dataEntrega} onChange={e => setFilters({...filters, dataEntrega: e.target.value})} />
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.fretista} onChange={e => setFilters({...filters, fretista: e.target.value})}>
            <option value="">Todos Fretistas</option>
            {fretistas.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
          </select>
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.motorista} onChange={e => setFilters({...filters, motorista: e.target.value})}>
            <option value="">Todos Motoristas</option>
            {motoristas.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.placa} onChange={e => setFilters({...filters, placa: e.target.value})}>
            <option value="">Todas Placas</option>
            {uniquePlacas.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.regiao} onChange={e => setFilters({...filters, regiao: e.target.value})}>
            <option value="">Todas Regiões</option>
            {regioes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.cliente} onChange={e => setFilters({...filters, cliente: e.target.value})}>
            <option value="">Todos Clientes</option>
            {clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
          </select>
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.rede} onChange={e => setFilters({...filters, rede: e.target.value})}>
            <option value="">Todas Redes</option>
            {uniqueRedes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.uf} onChange={e => setFilters({...filters, uf: e.target.value})}>
            <option value="">Todos UF</option>
            {uniqueUFs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.vendedor} onChange={e => setFilters({...filters, vendedor: e.target.value})}>
            <option value="">Todos Vendedores</option>
            {uniqueVendedores.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.cidade} onChange={e => setFilters({...filters, cidade: e.target.value})}>
            <option value="">Todas Cidades</option>
            {uniqueCidades.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredRotas.map((rota) => {
          const statusBySlot = (rota.cargaSlots || []).map((arr) => {
            if (!arr || arr.length === 0) return 'Pendente' as const;
            const statuses = arr
              .map(nome => {
                const idx = rota.clientes.findIndex(c => c === nome);
                return rota.entregaStatusByIndex?.[idx] || 'Pendente';
              });
            if (statuses.some(s => s === 'Pendente')) return 'Pendente';
            if (statuses.some(s => s === 'Devolvida')) return 'Devolvida';
            return 'Entregue';
          });
          return (
            <div key={rota.id} ref={(el) => { refsMap.current[rota.id] = el; }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                    {[
                      { label: 'Data', value: new Date(rota.dataEntrega).toLocaleDateString('pt-BR'), field: 'dataEntrega', type: 'date' },
                      { label: 'Região', value: rota.regiao, field: 'regiao', type: 'text' },
                      { label: 'Nº Carga', value: rota.numeroCarga, field: 'numeroCarga', type: 'text' },
                      { label: 'Placa', value: rota.placa, field: 'placa', type: 'text' },
                      { label: 'Motorista', value: rota.motorista, field: 'motorista', type: 'text' },
                      { label: 'Veículo', value: rota.tipoVeiculo, field: 'tipoVeiculo', type: 'text' },
                      { label: 'Peso', value: `${rota.pesoCarga} kg`, field: 'pesoCarga', type: 'number' },
                      { label: 'Ocupação', value: `${rota.taxaOcupacao.toFixed(1)}%`, field: '', type: 'text' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">{item.label}</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {editingRota === rota.id && item.field ? (
                            <input
                              type={item.type}
                              value={editingFields[item.field] || ''}
                              onChange={(e) => setEditingFields({...editingFields, [item.field]: e.target.value})}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            />
                          ) : (
                            item.value
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {editingRota === rota.id && (
                    <div className="flex justify-end gap-2 mb-4">
                      <button
                        onClick={handleSaveRota}
                        className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        <Save size={14} /> Salvar
                      </button>
                      <button
                        onClick={handleCancelEditRota}
                        className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        <X size={14} /> Cancelar
                      </button>
                    </div>
                  )}
                  {editingRota !== rota.id && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => handleEditRota(rota.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
                      >
                        <Edit2 size={14} /> Editar Rota
                      </button>
                    </div>
                  )}
                  <div className="w-full">
                    <div className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-slate-700 px-6 py-3 rounded-t-xl">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-1 font-bold">Seq.</div>
                        <div className="col-span-8 font-bold">Cliente</div>
                        <div className="col-span-3 font-bold text-right">Status</div>
                      </div>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={rota.clientes
                          .map((cliente, idx) => cliente ? `${rota.id}-${idx}` : null)
                          .filter(Boolean) as string[]}
                        strategy={verticalListSortingStrategy}
                      >
                        {rota.clientes.map((cliente, idx) => (
                           cliente && (
                             <SortableCliente
                               key={`${rota.id}-${idx}`}
                               id={`${rota.id}-${idx}`}
                               cliente={cliente}
                               idx={idx}
                               rotaId={rota.id}
                               onEdit={() => handleEditCliente(rota.id, idx)}
                               isEditing={editingCliente === `${rota.id}-${idx}`}
                               onSave={(novoCliente) => handleSaveCliente(rota.id, idx, novoCliente)}
                               onCancel={() => handleCancelEditCliente(rota.id, idx)}
                               status={rota.entregaStatusByIndex?.[idx] || 'Pendente'}
                               comentario={String(rota.entregaComentarioByIndex?.[idx] || '')}
                             />
                           )
                         ))}
                      </SortableContext>
                      <DragOverlay>
                        {activeId ? (
                          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-4 opacity-90">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                                <div className="w-4 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                                <div className="w-4 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full absolute mt-1"></div>
                              </div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {(() => {
                                  const [rotaId, idx] = (activeId as string).split('-');
                                  const rota = filteredRotas.find(r => r.id === rotaId);
                                  const index = parseInt(idx);
                                  return rota?.clientes[index] || '';
                                })()}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </div>
                </div>
                <div className="p-8 bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
                  <h3 className="font-bold text-gray-700 dark:text-white mb-6 text-center w-full uppercase tracking-widest text-sm">Mapa de Carregamento</h3>
                  {(() => {
                    const slots = rota.cargaSlots?.map(arr => (arr && arr.length ? arr.join(' + ') : null)) || [];
                    return <TruckMapVisual clientes={slots} tipoVeiculo={rota.tipoVeiculo} statusBySlot={statusBySlot} />;
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </DndContext>
  );
};

export default Resumo;
