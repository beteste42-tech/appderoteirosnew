import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, Truck, MapPin, Package, Calculator, XCircle, LayoutDashboard } from 'lucide-react';
import TruckMapVisual from '../components/TruckMapVisual';
import PageHeader from '../components/PageHeader';
import { cn } from '../lib/utils';
import { FileDown } from 'lucide-react';
import { exportElementToPdf } from '../lib/pdf';

const Dashboard = () => {
  const { rotas, clientes, fretistas, motoristas, veiculos, regioes, theme, user, updateEntregaStatus, updateEntregaComentario } = useApp();
  const initialFilters = { search: '', dataEntrega: '', fretista: '', motorista: '', placa: '', regiao: '', cliente: '', rede: '', uf: '', vendedor: '', cidade: '', periodo: '' };
  const [filters, setFilters] = useState(initialFilters);
  const clearFilters = () => setFilters(initialFilters);

  // Função para calcular data baseada no período
  const getDataByPeriodo = (periodo: string) => {
    if (!periodo) return '';
    const hoje = new Date();
    const dias = periodo === '7' ? 7 : periodo === '15' ? 15 : periodo === '30' ? 30 : 0;
    if (dias === 0) return '';
    const dataLimite = new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000);
    return dataLimite.toISOString().split('T')[0];
  };

  const clienteByNome = useMemo(() => {
    const map = new Map<string, typeof clientes[number]>();
    clientes.forEach(c => map.set(c.nome, c));
    return map;
  }, [clientes]);

  const filteredRotas = useMemo(() => {
    return rotas.filter(rota => {
      const matchSearch = filters.search === '' || Object.values(rota).some(val => String(val).toLowerCase().includes(filters.search.toLowerCase()));
      const dataPeriodo = getDataByPeriodo(filters.periodo);
      const matchData = (!filters.dataEntrega || rota.dataEntrega === filters.dataEntrega) && 
                      (!filters.periodo || rota.dataEntrega >= dataPeriodo);
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

  const totalRotas = filteredRotas.length;
  const totalPeso = filteredRotas.reduce((acc, curr) => acc + curr.pesoCarga, 0);
  const avgOcupacao = totalRotas > 0 ? filteredRotas.reduce((acc, curr) => acc + curr.taxaOcupacao, 0) / totalRotas : 0;
  const totalEntregas = filteredRotas.reduce((acc, curr) => acc + curr.clientes.filter(c => c !== null).length, 0);
  const pesoMedio = totalRotas > 0 ? totalPeso / totalRotas : 0;

  const dataByFretista = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRotas.forEach(r => { counts[r.fretista] = (counts[r.fretista] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredRotas]);

  const dataByPlaca = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRotas.forEach(r => { 
      const entregas = r.clientes.filter(c => c).length;
      counts[r.placa] = (counts[r.placa] || 0) + entregas; 
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredRotas]);

  const dataByRegiao = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRotas.forEach(r => { 
      const entregas = r.clientes.filter(c => c).length;
      counts[r.regiao] = (counts[r.regiao] || 0) + entregas; 
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredRotas]);

  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(filteredRotas.length || 1);
  const currentRota = filteredRotas[currentPage];
  const handlePageChange = (newPage: number) => { if (newPage >= 0 && newPage < totalPages) setCurrentPage(newPage); };
  React.useEffect(() => { setCurrentPage(0); }, [filters]);

  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#475569';
  const chartBarColor = '#003e2a';
  const uniquePlacas = Array.from(new Set(veiculos.map(v => v.placa)));
  const uniqueRedes = Array.from(new Set(clientes.map(c => c.rede).filter(Boolean)));
  const uniqueUFs = Array.from(new Set(clientes.map(c => c.uf).filter(Boolean)));
  const uniqueVendedores = Array.from(new Set(clientes.map(c => c.vendedor).filter(Boolean)));
  const uniqueCidades = Array.from(new Set(clientes.map(c => c.cidade).filter(Boolean)));

  const [statusByIndex, setStatusByIndex] = useState<Record<number, 'Pendente' | 'Entregue' | 'Devolvida'>>({});
  useEffect(() => {
    if (currentRota && currentRota.entregaStatusByIndex) {
      const map: Record<number, 'Pendente' | 'Entregue' | 'Devolvida'> = {};
      currentRota.entregaStatusByIndex.forEach((s, i) => { map[i] = s || 'Pendente'; });
      setStatusByIndex(map);
    } else {
      setStatusByIndex({});
    }
  }, [currentRota?.id]);

  const nextStatus = (s: 'Pendente' | 'Entregue' | 'Devolvida'): 'Pendente' | 'Entregue' | 'Devolvida' => {
    if (s === 'Pendente') return 'Entregue';
    if (s === 'Entregue') return 'Devolvida';
    return 'Pendente';
  };
  const canEditStatus = user?.role === 'admin' || user?.role === 'operador';
  const onStatusClick = (idx: number) => {
    const current = statusByIndex[idx] || 'Pendente';
    const updated = nextStatus(current);
    setStatusByIndex(prev => ({ ...prev, [idx]: updated }));
    if (currentRota) updateEntregaStatus(currentRota.id, idx, updated);
  };

  const [commentOpenIdx, setCommentOpenIdx] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState<string>('');
  useEffect(() => {
    if (currentRota && typeof commentOpenIdx === 'number') {
      const existing = currentRota.entregaComentarioByIndex?.[commentOpenIdx] || '';
      setCommentDraft(existing || '');
    }
  }, [commentOpenIdx, currentRota?.id]);
  const handleSaveComment = async (idx: number) => {
    if (!currentRota) return;
    const text = (commentDraft || '').slice(0, 500);
    const existing = currentRota.entregaComentarioByIndex?.[idx] || '';
    const combined = existing ? `${existing}\n${text}` : text;
    await updateEntregaComentario(currentRota.id, idx, combined);
    setCommentDraft('');
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handleExportPdf = async () => {
    if (!currentRota || !printRef.current) return;
    const info = [
      { label: 'Data', value: new Date(currentRota.dataEntrega).toLocaleDateString('pt-BR') },
      { label: 'Região', value: currentRota.regiao },
      { label: 'Nº Carga', value: currentRota.numeroCarga },
      { label: 'Placa', value: currentRota.placa },
      { label: 'Motorista', value: currentRota.motorista },
      { label: 'Veículo', value: currentRota.tipoVeiculo },
      { label: 'Peso', value: `${currentRota.pesoCarga} kg` },
      { label: 'Ocupação', value: `${currentRota.taxaOcupacao.toFixed(1)}%` },
    ];
    await exportElementToPdf(printRef.current, {
      fileName: `Rota_${currentRota.id}.pdf`,
      title: 'Roteiriza GDM — Rota',
      subtitle: `Rota ${currentRota.id}`,
      info,
      logoUrl: 'https://i.ibb.co/Hp2fcxR1/grupo-docemel-logo-square.png'
    });
  };
  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
      <PageHeader 
        title="Painel de Controle" 
        description="Visão geral da operação logística, indicadores de performance e monitoramento de rotas."
        icon={LayoutDashboard}
      />
      
      {/* Header & Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            Filtros Avançados
          </h2>
          <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full transition-colors">
            <XCircle size={14} /> Limpar
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="text" placeholder="Pesquisa Dinâmica..." className="w-full pl-10 p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          </div>
          <select className="p-2.5 border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-primary focus:border-primary" value={filters.periodo} onChange={e => setFilters({...filters, periodo: e.target.value})}>
            <option value="">Período</option>
            <option value="7">Últimos 7 dias</option>
            <option value="15">Últimos 15 dias</option>
            <option value="30">Últimos 30 dias</option>
          </select>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-primary to-primary-light dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 text-white shadow-lg border border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 font-medium text-sm">Nº de Rotas</p>
              <h3 className="text-3xl font-bold mt-2">{totalRotas}</h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm"><Truck size={24} /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-gray-800 dark:text-white shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Peso Total (kg)</p>
              <h3 className="text-3xl font-bold mt-2 text-primary dark:text-white">{totalPeso.toLocaleString('pt-BR')}</h3>
            </div>
            <div className="bg-primary/10 dark:bg-white/10 p-2.5 rounded-xl text-primary dark:text-white"><Package size={24} /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-gray-800 dark:text-white shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">% Ocupação Média</p>
              <h3 className="text-3xl font-bold mt-2 text-primary dark:text-white">{avgOcupacao.toFixed(1)}%</h3>
            </div>
            <div className="bg-primary/10 dark:bg-white/10 p-2.5 rounded-xl text-primary dark:text-white"><Calculator size={24} /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-800 rounded-2xl p-6 text-white shadow-lg border border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 font-medium text-sm">Peso Médio</p>
              <h3 className="text-3xl font-bold mt-2">{(pesoMedio/1000).toFixed(1)}t</h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm"><Calculator size={24} /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-gray-800 dark:text-white shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Nº de Entregas</p>
              <h3 className="text-3xl font-bold mt-2 text-primary dark:text-white">{totalEntregas}</h3>
            </div>
            <div className="bg-primary/10 dark:bg-white/10 p-2.5 rounded-xl text-primary dark:text-white"><MapPin size={24} /></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-6">Rotas por Fretista</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByFretista}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: chartTextColor}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: chartTextColor}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" fill={chartBarColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-6">Entregas por Placa</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByPlaca}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: chartTextColor}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: chartTextColor}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" fill="#005c3e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-6">Entregas por Região</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByRegiao}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: chartTextColor}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: chartTextColor}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Route Details */}
      {currentRota ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-primary dark:bg-slate-950 text-white p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg"><Truck size={20} /></div>
              <span className="truncate">Rota: {currentRota.id}</span>
            </h2>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-sm bg-white/20 px-4 py-1.5 rounded-full font-medium backdrop-blur-sm">{currentRota.status}</span>
              <div className="flex gap-2 items-center bg-black/20 rounded-lg p-1">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="px-3 py-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors">◀</button>
                <span className="text-sm font-mono px-2">{currentPage + 1} / {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} className="px-3 py-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors">▶</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3" ref={printRef}>
            <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-slate-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                {[
                  { label: 'Data', value: new Date(currentRota.dataEntrega).toLocaleDateString('pt-BR') },
                  { label: 'Região', value: currentRota.regiao },
                  { label: 'Nº Carga', value: currentRota.numeroCarga },
                  { label: 'Placa', value: currentRota.placa },
                  { label: 'Motorista', value: currentRota.motorista },
                  { label: 'Veículo', value: currentRota.tipoVeiculo },
                  { label: 'Peso', value: `${currentRota.pesoCarga} kg` },
                  { label: 'Ocupação', value: `${currentRota.taxaOcupacao.toFixed(1)}%`, highlight: true },
                ].map((item, idx) => (
                  <div key={idx}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1 tracking-wide">{item.label}</p>
                    <p className={cn("font-bold text-gray-900 dark:text-white break-words text-lg", item.highlight && (parseFloat(item.value) > 100 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"))}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary" /> Sequência de Entrega
              </h3>
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 min-w-[300px]">
                      <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-slate-700">
                        <tr>
                          <th className="px-6 py-3 whitespace-nowrap">Seq.</th>
                          <th className="px-6 py-3 whitespace-nowrap">Cliente</th>
                          <th className="px-6 py-3 text-right whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                    {currentRota.clientes.map((cliente, idx) => (
                      cliente && (
                        <React.Fragment key={idx}>
                        <tr className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{idx + 1}</td>
                          <td className="px-6 py-4 font-medium">
                            {cliente}
                            {currentRota.entregaComentarioByIndex?.[idx] ? (
                              String(currentRota.entregaComentarioByIndex[idx])
                                .split('\n')
                                .filter(Boolean)
                                .map((line, i) => (
                                  <div key={i} className="mt-1 text-xs italic text-gray-400 dark:text-gray-300 break-all">
                                    {line}
                                  </div>
                                ))
                            ) : null}
                            {commentOpenIdx === idx ? (
                              <div className="mt-3">
                                <textarea
                                  value={commentDraft}
                                  onChange={(e) => setCommentDraft(e.target.value.slice(0,500))}
                                  placeholder="Digite um comentário (até 500 caracteres)"
                                  className="w-full border border-gray-300 dark:border-slate-700 rounded-md p-2 text-sm bg-white dark:bg-slate-700"
                                  rows={3}
                                />
                                <div className="flex justify-end mt-2 gap-2">
                                  <button
                                    onClick={() => setCommentOpenIdx(null)}
                                    className="px-3 py-1 text-xs rounded-md border bg-gray-100 dark:bg-slate-700"
                                  >Cancelar</button>
                                  <button
                                    onClick={() => handleSaveComment(idx)}
                                    className="px-3 py-1 text-xs rounded-md border bg-green-600 text-white"
                                  >Salvar</button>
                                </div>
                              </div>
                            ) : null}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => canEditStatus && onStatusClick(idx)}
                              className={cn(
                                "text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center justify-center transition-colors",
                                statusByIndex[idx] === 'Entregue' ? "bg-green-100 text-green-800 border-green-200"
                                : statusByIndex[idx] === 'Devolvida' ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-red-100 text-red-800 border-red-200",
                                !canEditStatus && "opacity-60 cursor-not-allowed"
                              )}
                              disabled={!canEditStatus}
                              title={canEditStatus ? "Clique para alternar status" : "Visualização apenas"}
                            >
                              {statusByIndex[idx] || 'Pendente'}
                            </button>
                            <button
                              onClick={() => setCommentOpenIdx(commentOpenIdx === idx ? null : idx)}
                              className="ml-2 text-xs px-3 py-1 rounded-full border bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 transition"
                            >
                              Comentário
                            </button>
                          </td>
                        </tr>
                        </React.Fragment>
                      )
                    ))}
                        </tbody>
                      </table>
                    </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
              <h3 className="font-bold text-gray-700 dark:text-white mb-6 text-center w-full uppercase tracking-widest text-sm">Mapa de Carregamento</h3>
              {(() => {
                const slots = currentRota.cargaSlots?.map(arr => (arr && arr.length ? arr.join(' + ') : null)) || [];
                const statusSlots = (currentRota.cargaSlots || []).map((arr) => {
                  if (!arr || arr.length === 0) return 'Pendente' as const;
                  const statuses = arr
                    .map(nome => {
                      const idx = currentRota.clientes.findIndex(c => c === nome);
                      return statusByIndex[idx] || 'Pendente';
                    });
                  if (statuses.some(s => s === 'Pendente')) return 'Pendente';
                  if (statuses.some(s => s === 'Devolvida')) return 'Devolvida';
                  return 'Entregue';
                });
                return <TruckMapVisual clientes={slots} tipoVeiculo={currentRota.tipoVeiculo} statusBySlot={statusSlots} />;
              })()}
              <div className="mt-6">
                <button
                  onClick={handleExportPdf}
                  className="bg-primary text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 hover:opacity-90 transition"
                >
                  <FileDown size={16} /> Compartilhar PDF
                </button>
              </div>
              {currentRota?.observacoes && (
                <div className="mt-8 w-full">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2 text-sm uppercase tracking-widest">Informações Complementares</h4>
                  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
                    {currentRota.observacoes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
          <div className="bg-gray-50 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhuma rota encontrada</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Tente ajustar os filtros acima ou crie uma nova rota na aba de Roteirização.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
