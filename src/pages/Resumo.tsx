import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import { Filter, FileDown, LayoutDashboard } from 'lucide-react';
import { exportElementsToPdf } from '../lib/pdf';
import { cn } from '../lib/utils';
import TruckMapVisual from '../components/TruckMapVisual';

const Resumo = () => {
  const { rotas, clientes, fretistas, motoristas, veiculos, regioes, theme } = useApp();
  const initialFilters = { search: '', dataEntrega: '', fretista: '', motorista: '', placa: '', regiao: '', cliente: '', rede: '', uf: '', vendedor: '', cidade: '' };
  const [filters, setFilters] = useState(initialFilters);
  const clearFilters = () => setFilters(initialFilters);

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
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
      <PageHeader 
        title="Resumo de Rotas" 
        description="Listagem detalhada de todas as rotas conforme filtros selecionados."
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
                      { label: 'Data', value: new Date(rota.dataEntrega).toLocaleDateString('pt-BR') },
                      { label: 'Região', value: rota.regiao },
                      { label: 'Nº Carga', value: rota.numeroCarga },
                      { label: 'Placa', value: rota.placa },
                      { label: 'Motorista', value: rota.motorista },
                      { label: 'Veículo', value: rota.tipoVeiculo },
                      { label: 'Peso', value: `${rota.pesoCarga} kg` },
                      { label: 'Ocupação', value: `${rota.taxaOcupacao.toFixed(1)}%` },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">{item.label}</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3">Seq.</th>
                        <th className="px-6 py-3">Cliente</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rota.clientes.map((cliente, idx) => (
                        cliente && (
                          <tr key={idx} className="border-b dark:border-slate-700">
                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{idx + 1}</td>
                            <td className="px-6 py-4 font-medium">
                              {cliente}
                              {rota.entregaComentarioByIndex?.[idx] ? (
                                String(rota.entregaComentarioByIndex[idx])
                                  .split('\n')
                                  .filter(Boolean)
                                  .map((line, i) => (
                                    <div key={i} className="mt-1 text-xs italic text-gray-400 dark:text-gray-300">
                                      {line}
                                    </div>
                                  ))
                              ) : null}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={cn(
                                "text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center justify-center",
                                rota.entregaStatusByIndex?.[idx] === 'Entregue' ? "bg-green-100 text-green-800 border-green-200"
                                : rota.entregaStatusByIndex?.[idx] === 'Devolvida' ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-red-100 text-red-800 border-red-200"
                              )}>
                                {rota.entregaStatusByIndex?.[idx] || 'Pendente'}
                              </span>
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
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
  );
};

export default Resumo;
