import React, { useState } from 'react';
import { useApp, RotaPadrao } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Map, Play, Plus, Star, Sparkles, Trash2, Edit } from 'lucide-react';
import { cn } from '../lib/utils';
import TruckMapVisual from '../components/TruckMapVisual';

const StandardRoutes = () => {
  const { rotasPadrao, sugestoesRotas, gerarRoteiroDePadrao, addRotaPadrao, clientes, veiculosTypes, regioes } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Form State para Nova Rota Padrão
  const [newRota, setNewRota] = useState<Partial<RotaPadrao>>({
    nome: '',
    regiao: '',
    tipoVeiculoSugerido: '3/4',
    clientes: Array(10).fill(null)
  });

  const handleGerar = (rota: RotaPadrao) => {
    const data = new Date().toISOString().split('T')[0];
    if (confirm(`Deseja gerar um roteiro ativo para hoje (${data}) baseado em "${rota.nome}"?`)) {
      gerarRoteiroDePadrao(rota, data);
      navigate('/rotas');
    }
  };

  const handleSaveNew = () => {
    if (!newRota.nome || !newRota.regiao) {
      alert('Preencha nome e região');
      return;
    }
    addRotaPadrao({
      id: `RP-${Date.now()}`,
      nome: newRota.nome!,
      regiao: newRota.regiao!,
      tipoVeiculoSugerido: newRota.tipoVeiculoSugerido!,
      clientes: newRota.clientes!,
      frequenciaUso: 0
    } as RotaPadrao);
    setShowModal(false);
    setNewRota({ nome: '', regiao: '', tipoVeiculoSugerido: '3/4', clientes: Array(10).fill(null) });
  };

  const handleClienteChange = (index: number, value: string) => {
    const newClientes = [...(newRota.clientes || [])];
    newClientes[index] = value === "" ? null : value;
    setNewRota({ ...newRota, clientes: newClientes });
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Map className="text-primary" />
            Rotas Padrão
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie modelos de rotas frequentes para agilizar a operação.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-bold transition-all"
        >
          <Plus size={20} />
          NOVA ROTA PADRÃO
        </button>
      </div>

      {/* Sugestões Inteligentes */}
      {sugestoesRotas.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Sugestões Inteligentes (IA)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sugestoesRotas.map((rota) => (
              <div key={rota.id} className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-800 border border-yellow-200 dark:border-yellow-700/30 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
                  Detectado {rota.frequenciaUso}x
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">{rota.nome}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{rota.regiao} • {rota.tipoVeiculoSugerido}</p>
                
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Sequência Principal:</p>
                  <div className="flex flex-wrap gap-1">
                    {rota.clientes.filter(c => c).slice(0, 3).map((c, i) => (
                      <span key={i} className="text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-2 py-1 rounded">
                        {c}
                      </span>
                    ))}
                    {(rota.clientes.filter(c => c).length > 3) && <span className="text-xs text-gray-400">...+{rota.clientes.filter(c => c).length - 3}</span>}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    addRotaPadrao({...rota, nome: `Rota Padrão - ${rota.regiao}`, id: `RP-${Date.now()}`});
                    alert("Adicionado às suas rotas padrão!");
                  }}
                  className="w-full py-2 border-2 border-primary text-primary dark:text-white dark:border-white rounded-lg font-bold hover:bg-primary hover:text-white transition-colors text-sm"
                >
                  SALVAR COMO PADRÃO
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Rotas Padrão */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <Star className="text-primary" size={20} />
        Meus Modelos Salvos
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {rotasPadrao.map((rota) => (
          <div key={rota.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{rota.nome}</h3>
                <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded uppercase font-bold">
                  {rota.regiao}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Veículo Sugerido: <span className="font-medium text-gray-700 dark:text-gray-300">{rota.tipoVeiculoSugerido}</span></p>
              
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-3 mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Prévia do Mapa:</p>
                <TruckMapVisual clientes={rota.clientes} tipoVeiculo={rota.tipoVeiculoSugerido} compact={true} />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900 p-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
              <button 
                onClick={() => handleGerar(rota)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Play size={16} />
                GERAR ROTEIRO
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Edit size={18} />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {rotasPadrao.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700">
            <Map size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhuma rota padrão cadastrada.</p>
            <p className="text-sm">Crie uma nova ou aguarde sugestões do sistema.</p>
          </div>
        )}
      </div>

      {/* Modal Nova Rota */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Nova Rota Padrão</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><Trash2 size={24} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Rota</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Ex: Rota Centro Segunda-feira"
                    value={newRota.nome}
                    onChange={e => setNewRota({...newRota, nome: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Região</label>
                  <select 
                    className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newRota.regiao}
                    onChange={e => setNewRota({...newRota, regiao: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {regioes.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Veículo Sugerido</label>
                  <select 
                    className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    value={newRota.tipoVeiculoSugerido}
                    onChange={e => setNewRota({...newRota, tipoVeiculoSugerido: e.target.value})}
                  >
                    {Object.keys(veiculosTypes).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2 border-b pb-1">Sequência de Clientes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {newRota.clientes?.map((cliente, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-6">{idx + 1}º</span>
                      <select 
                        className="flex-1 p-2 text-sm border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={cliente || ""}
                        onChange={e => handleClienteChange(idx, e.target.value)}
                      >
                        <option value="">(Vazio)</option>
                        {clientes.map(c => (
                          <option key={c.id} value={c.nome}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleSaveNew} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-light">Salvar Modelo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardRoutes;
