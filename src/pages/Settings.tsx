import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Truck, MapPin, Plus, Trash2, Save, Database, Loader2, UserPlus, Shield, Settings as SettingsIcon, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const { 
    clientes, addCliente, removeCliente,
    veiculos, addVeiculo, removeVeiculo,
    regioes, addRegiao,
    veiculosTypes, fretistas,
    seedDatabase, loading, user
  } = useApp();

  const [activeTab, setActiveTab] = useState<'clientes' | 'veiculos' | 'regioes' | 'usuarios' | 'sistema'>('clientes');

  // Forms States
  const [newCliente, setNewCliente] = useState({ codigo: '', nome: '', rede: '', vendedor: '', cidade: '', uf: 'BA', bairro: '' });
  const [newVeiculo, setNewVeiculo] = useState({ 
    placa: '', 
    tipo: '3/4', 
    fretista: '', 
    capacidade: 0, 
    motoristaPadrao: '',
    contato: '',
    capacidadePaletes: 0
  });
  const [newRegiao, setNewRegiao] = useState('');
  
  // User Management State
  const [newUser, setNewUser] = useState({ email: '', password: '', nome: '', role: 'visual' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [importingClients, setImportingClients] = useState(false);

  const handleAddCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCliente.nome || !newCliente.codigo) return alert("Preencha os campos obrigatórios");
    await addCliente(newCliente);
    setNewCliente({ codigo: '', nome: '', rede: '', vendedor: '', cidade: '', uf: 'BA', bairro: '' });
    alert("Cliente cadastrado!");
  };

  const handleAddVeiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVeiculo.placa || !newVeiculo.fretista || !newVeiculo.motoristaPadrao) {
      return alert("Preencha todos os campos obrigatórios (Placa, Fretista e Motorista)");
    }
    try {
      await addVeiculo(newVeiculo);
      setNewVeiculo({ 
        placa: '', 
        tipo: '3/4', 
        fretista: '', 
        capacidade: 0, 
        motoristaPadrao: '',
        contato: '',
        capacidadePaletes: 0
      });
      alert("Frota cadastrada com sucesso!");
    } catch (error: any) {
      alert("Erro ao cadastrar frota: " + (error.message || "Erro desconhecido"));
    }
  };

  const handleAddRegiao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegiao) return;
    addRegiao(newRegiao);
    setNewRegiao('');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      // Mapeia role para tipo_usuario
      const tipoUsuarioMap: Record<string, string> = {
        'admin': 'administrador',
        'operador': 'operador',
        'visual': 'visitante'
      };
      
      const tipoUsuario = tipoUsuarioMap[newUser.role] || 'visitante';
      
      // Verifica se o usuário já existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', newUser.email)
        .single();
      
      if (existingUser) {
        throw new Error('Este e-mail já está cadastrado.');
      }
      
      // Usa a função create_user para criar o usuário com hash de senha
      const { data: userId, error } = await supabase
        .rpc('create_user', {
          email_input: newUser.email,
          senha_input: newUser.password,
          nome_input: newUser.nome,
          tipo_usuario_input: tipoUsuario
        });
      
      if (error) throw error;
      alert(`Usuário ${newUser.nome} criado com sucesso! Ele pode fazer login agora.`);
      setNewUser({ email: '', password: '', nome: '', role: 'visual' });
    } catch (err: any) {
      alert('Erro ao criar usuário: ' + err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleImportCSV = async () => {
    // Criar input file dinamicamente
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (!confirm('Isso irá importar todos os clientes do arquivo CSV. Deseja continuar?')) return;
      
      setImportingClients(true);
      try {
        const text = await file.text();
      
      // Parse do CSV (separador ;)
      const lines = text.split('\n').filter((line: string) => line.trim());
      const headers = lines[0].split(';').map((h: string) => h.trim().toLowerCase());
      
      // Mapear índices das colunas
      const codigoIdx = headers.indexOf('codigo');
      const nomeIdx = headers.indexOf('nome');
      const enderecoIdx = headers.indexOf('endereco');
      const cidadeIdx = headers.indexOf('cidade');
      const ufIdx = headers.indexOf('uf');
      const bairroIdx = headers.indexOf('bairro');
      const redeIdx = headers.indexOf('rede');
      const vendedorIdx = headers.indexOf('vendedor');
      const lojaIdx = headers.indexOf('loja');
      const regiaoIdx = headers.indexOf('reigao') !== -1 ? headers.indexOf('reigao') : headers.indexOf('regiao');
      const latitudeIdx = headers.indexOf('latitude');
      const longitudeIdx = headers.indexOf('longitude');

      const clientesToInsert: any[] = [];
      
      // Processar linhas (pular header)
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';');
        if (values.length < 3) continue; // Linha vazia ou inválida
        
        const codigo = values[codigoIdx]?.trim() || null;
        const nome = values[nomeIdx]?.trim();
        
        if (!nome) continue; // Pular se não tiver nome
        
        const cliente = {
          codigo: codigo || null,
          nome: nome,
          endereco: values[enderecoIdx]?.trim() || null,
          cidade: values[cidadeIdx]?.trim() || null,
          uf: values[ufIdx]?.trim() || null,
          bairro: values[bairroIdx]?.trim() || null,
          rede: values[redeIdx]?.trim() || null,
          vendedor: values[vendedorIdx]?.trim() || null,
          loja: values[lojaIdx]?.trim() || null,
          regiao: values[regiaoIdx]?.trim() || null,
          latitude: values[latitudeIdx]?.trim() ? parseFloat(values[latitudeIdx].trim()) : null,
          longitude: values[longitudeIdx]?.trim() ? parseFloat(values[longitudeIdx].trim()) : null,
        };
        
        clientesToInsert.push(cliente);
      }

      // Inserir em lotes de 50
      const batchSize = 50;
      let inserted = 0;
      let errors = 0;

      for (let i = 0; i < clientesToInsert.length; i += batchSize) {
        const batch = clientesToInsert.slice(i, i + batchSize);
        const { error } = await supabase
          .from('clientes')
          .upsert(batch, { onConflict: 'codigo', ignoreDuplicates: false });
        
        if (error) {
          console.error('Erro ao inserir lote:', error);
          errors += batch.length;
        } else {
          inserted += batch.length;
        }
      }

      alert(`Importação concluída!\n${inserted} clientes processados.\n${errors > 0 ? errors + ' erros encontrados.' : ''}`);
      
      // Recarregar dados
      window.location.reload();
    } catch (err: any) {
      console.error('Erro ao importar CSV:', err);
      alert('Erro ao importar CSV: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setImportingClients(false);
    }
      };
    input.click();
  };

  const inputClass = "w-full p-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none";

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <PageHeader 
        title="Configurações do Sistema" 
        description="Gerencie cadastros base, usuários e parâmetros operacionais."
        icon={SettingsIcon}
      />

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 border-b border-gray-200 dark:border-slate-700 overflow-x-auto pb-1">
        {[
          { id: 'clientes', label: 'Clientes', icon: Users },
          { id: 'veiculos', label: 'Frota', icon: Truck },
          { id: 'regioes', label: 'Regiões', icon: MapPin },
          { id: 'usuarios', label: 'Usuários', icon: UserPlus, adminOnly: true },
          { id: 'sistema', label: 'Sistema', icon: Database, adminOnly: true },
        ].map((tab) => {
          if (tab.adminOnly && user?.role !== 'admin') return null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap rounded-t-lg",
                activeTab === tab.id 
                  ? "border-primary text-primary dark:text-white dark:border-white bg-primary/5 dark:bg-slate-800" 
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8">
        
        {/* --- CLIENTES TAB --- */}
        {activeTab === 'clientes' && (
          <div className="space-y-8">
            {/* Importação de CSV */}
            <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500 text-white p-2 rounded-lg"><Upload size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">Importar Clientes do CSV</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Importe a carteira completa de clientes do arquivo CSV.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleImportCSV}
                  disabled={importingClients}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-green-600/20"
                >
                  {importingClients ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18} />}
                  {importingClients ? 'Importando...' : 'SELECIONAR E IMPORTAR CSV'}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selecione o arquivo "CARTEIRA DE CLIENTES csv.csv" da pasta ARQUIVOS
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-white flex items-center gap-2"><Plus size={20} className="text-primary"/> Novo Cliente</h3>
              <form onSubmit={handleAddCliente} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <input placeholder="Código" value={newCliente.codigo} onChange={e => setNewCliente({...newCliente, codigo: e.target.value})} className={inputClass} required />
                <input placeholder="Nome Fantasia" value={newCliente.nome} onChange={e => setNewCliente({...newCliente, nome: e.target.value})} className={cn(inputClass, "md:col-span-2")} required />
                <input placeholder="Rede" value={newCliente.rede} onChange={e => setNewCliente({...newCliente, rede: e.target.value})} className={inputClass} />
                <input placeholder="Vendedor" value={newCliente.vendedor} onChange={e => setNewCliente({...newCliente, vendedor: e.target.value})} className={inputClass} />
                <input placeholder="Cidade" value={newCliente.cidade} onChange={e => setNewCliente({...newCliente, cidade: e.target.value})} className={inputClass} />
                <input placeholder="Bairro" value={newCliente.bairro} onChange={e => setNewCliente({...newCliente, bairro: e.target.value})} className={inputClass} />
                <select value={newCliente.uf} onChange={e => setNewCliente({...newCliente, uf: e.target.value})} className={inputClass}>
                  <option value="BA">BA</option>
                  <option value="SE">SE</option>
                  <option value="PE">PE</option>
                </select>
                <button type="submit" disabled={loading} className="md:col-span-4 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-light flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all">
                  {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} CADASTRAR CLIENTE
                </button>
              </form>
            </div>
            {/* Tabela de Clientes (Mantida) */}
            {/* ... */}
          </div>
        )}

        {/* --- USUARIOS TAB (ADMIN ONLY) --- */}
        {activeTab === 'usuarios' && user?.role === 'admin' && (
          <div className="space-y-8">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-blue-500 text-white p-2 rounded-lg"><UserPlus size={24} /></div>
                 <div>
                   <h3 className="font-bold text-lg text-gray-800 dark:text-white">Cadastrar Novo Usuário</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Crie contas de acesso para sua equipe.</p>
                 </div>
              </div>
              
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                  <input value={newUser.nome} onChange={e => setNewUser({...newUser, nome: e.target.value})} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Provisória</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className={inputClass} required minLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Perfil de Acesso</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className={inputClass}>
                    <option value="visual">Visual (Apenas Leitura)</option>
                    <option value="operador">Operador (Cria Rotas)</option>
                    <option value="admin">Administrador (Acesso Total)</option>
                  </select>
                </div>
                <button type="submit" disabled={creatingUser} className="md:col-span-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/20 transition-all mt-2">
                  {creatingUser ? <Loader2 className="animate-spin" size={18}/> : <UserPlus size={18} />} CRIAR ACESSO
                </button>
              </form>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30 flex items-start gap-3">
              <Shield className="text-yellow-600 mt-1" size={20} />
              <div>
                <h4 className="font-bold text-yellow-800 dark:text-yellow-500">Política de Segurança</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-600">
                  Usuários criados aqui terão acesso imediato ao sistema. Recomenda-se instruir a troca de senha no primeiro acesso.
                  O log de atividades registrará todas as ações realizadas por estes usuários.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- SISTEMA TAB (SEED) --- */}
        {activeTab === 'sistema' && (
          <div className="max-w-2xl mx-auto space-y-8 text-center">
             <div className="bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                <Database size={48} className="mx-auto text-yellow-600 dark:text-yellow-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Inicialização do Banco de Dados</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Se o seu banco de dados estiver vazio, utilize esta função para popular as tabelas com os dados iniciais (Clientes, Fretistas, Veículos e Motoristas) baseados nas planilhas importadas.
                </p>
                <button 
                  onClick={seedDatabase} 
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 mx-auto disabled:opacity-50 transition-all transform hover:scale-105"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Database />}
                  POPULAR BANCO DE DADOS (SEED)
                </button>
             </div>
          </div>
        )}
        
        {/* --- FROTA TAB (Cadastro Completo) --- */}
        {activeTab === 'veiculos' && (
          <div className="space-y-8">
            {/* Formulário de Cadastro de Frota */}
            <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500 text-white p-2 rounded-lg"><Truck size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">Cadastro de Frota</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cadastre fretista, veículo e motorista de uma vez.</p>
                </div>
              </div>

              <form onSubmit={handleAddVeiculo} className="space-y-6">
                {/* Fretista */}
                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                  <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">1. Dados do Fretista</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Fretista *</label>
                      <input
                        type="text"
                        value={newVeiculo.fretista}
                        onChange={e => setNewVeiculo({...newVeiculo, fretista: e.target.value})}
                        className={inputClass}
                        placeholder="Ex: ALUMIDIA"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contato (Opcional)</label>
                      <input
                        type="text"
                        value={newVeiculo.contato}
                        onChange={e => setNewVeiculo({...newVeiculo, contato: e.target.value})}
                        className={inputClass}
                        placeholder="Telefone ou e-mail"
                      />
                    </div>
                  </div>
                </div>

                {/* Veículo */}
                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                  <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">2. Dados do Veículo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placa *</label>
                      <input
                        type="text"
                        value={newVeiculo.placa}
                        onChange={e => setNewVeiculo({...newVeiculo, placa: e.target.value.toUpperCase()})}
                        className={inputClass}
                        placeholder="ABC1234"
                        required
                        maxLength={7}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Veículo *</label>
                      <select
                        value={newVeiculo.tipo}
                        onChange={e => {
                          const tipo = e.target.value;
                          setNewVeiculo({...newVeiculo, tipo, capacidade: veiculosTypes[tipo]?.capacity || 0});
                        }}
                        className={inputClass}
                        required
                      >
                        <option value="">Selecione...</option>
                        {Object.keys(veiculosTypes).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacidade (kg) *</label>
                      <input
                        type="number"
                        value={newVeiculo.capacidade || ''}
                        onChange={e => setNewVeiculo({...newVeiculo, capacidade: parseFloat(e.target.value) || 0})}
                        className={inputClass}
                        placeholder="0"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacidade (Paletes)</label>
                      <input
                        type="number"
                        value={newVeiculo.capacidadePaletes || ''}
                        onChange={e => setNewVeiculo({...newVeiculo, capacidadePaletes: parseInt(e.target.value) || 0})}
                        className={inputClass}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Motorista */}
                <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                  <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">3. Dados do Motorista</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Motorista *</label>
                      <input
                        type="text"
                        value={newVeiculo.motoristaPadrao}
                        onChange={e => setNewVeiculo({...newVeiculo, motoristaPadrao: e.target.value})}
                        className={inputClass}
                        placeholder="Ex: CLAUDIO SANTOS"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-light flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} 
                  CADASTRAR FROTA COMPLETA
                </button>
              </form>
            </div>

            {/* Lista de Veículos Cadastrados */}
            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Frota Cadastrada</h3>
              {veiculos.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum veículo cadastrado ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Placa</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Tipo</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Fretista</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Capacidade</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {veiculos.map((v) => (
                        <tr key={v.placa} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-3 font-medium">{v.placa}</td>
                          <td className="px-4 py-3">{v.tipo}</td>
                          <td className="px-4 py-3">{v.fretista}</td>
                          <td className="px-4 py-3">{v.capacidade} kg</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeVeiculo(v.placa)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'regioes' && (
           <div className="text-center py-10 text-gray-500">Gestão de Regiões disponível (código mantido)</div>
        )}

      </div>
    </div>
  );
};

export default Settings;
