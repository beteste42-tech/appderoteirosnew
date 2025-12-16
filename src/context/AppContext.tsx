import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CLIENTES, FRETISTAS, PLACAS, REGIOES, VEICULOS_TYPES } from '../data/mockData';

// Interfaces
export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'operador' | 'visual' | 'pendente'; // administrador -> admin, operador -> operador, visitante -> visual, pendente -> pendente
}

export interface Rota {
  id: string;
  dataEntrega: string;
  regiao: string;
  numeroCarga: string;
  fretista: string;
  placa: string;
  motorista: string;
  tipoVeiculo: string;
  pesoCarga: number;
  qtdPaletes: number;
  taxaOcupacao: number;
  clientes: (string | null)[];
  entregaStatusByIndex?: ('Pendente' | 'Entregue' | 'Devolvida')[];
  entregaComentarioByIndex?: (string | null)[];
  cargaSlots?: string[][];
  observacoes: string;
  status: 'Criada' | 'Em Transito' | 'Finalizada';
}

export interface RotaPadrao {
  id: string;
  nome: string;
  regiao: string;
  tipoVeiculoSugerido: string;
  clientes: (string | null)[];
  frequenciaUso?: number;
}

export interface Cliente {
  id: string | number;
  codigo: string;
  nome: string;
  rede: string;
  vendedor: string;
  cidade: string;
  uf: string;
  bairro: string;
}

export interface VeiculoData {
  placa: string;
  tipo: string;
  fretista: string;
  capacidade: number;
  motoristaPadrao: string;
}

type Theme = 'light' | 'dark';

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateEntregaStatus: (rotaId: string, ordem: number, status: 'Pendente' | 'Entregue' | 'Devolvida') => Promise<void>;
  updateEntregaComentario: (rotaId: string, ordem: number, comentario: string) => Promise<void>;
  
  clientes: Cliente[];
  veiculos: VeiculoData[];
  regioes: string[];
  fretistas: { id: number | string; nome: string }[];
  motoristas: string[];
  loading: boolean;
  
  addCliente: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  addVeiculo: (veiculo: VeiculoData) => Promise<void>;
  addRegiao: (regiao: string) => void;
  removeCliente: (id: string | number) => Promise<void>;
  removeVeiculo: (placa: string) => Promise<void>;

  rotas: Rota[];
  addRota: (rota: Omit<Rota, 'id'>) => Promise<void>;
  
  rotasPadrao: RotaPadrao[];
  addRotaPadrao: (rota: RotaPadrao) => void;
  gerarRoteiroDePadrao: (rotaPadrao: RotaPadrao, dataEntrega: string) => void;
  sugestoesRotas: RotaPadrao[];

  theme: Theme;
  toggleTheme: () => void;
  
  veiculosTypes: typeof VEICULOS_TYPES;
  seedDatabase: () => Promise<void>;
  seedUsers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Monitora mudanças no estado user para debug
  useEffect(() => {
    // #region agent log
    const logData = {location:'AppContext.tsx:116',message:'user state changed',data:{hasUser:!!user,userId:user?.id,userEmail:user?.email,userRole:user?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
    console.log('🔍 DEBUG LOG:', logData);
    const agentLogUrl = import.meta.env.VITE_AGENT_LOG_URL;
    if (agentLogUrl) {
      fetch(agentLogUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    }
    // #endregion
  }, [user]); 
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<VeiculoData[]>([]);
  const [regioes, setRegioes] = useState<string[]>(REGIOES);
  const [fretistas, setFretistas] = useState<{ id: string | number; nome: string }[]>([]);
  const [motoristas, setMotoristas] = useState<string[]>([]);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [rotasPadrao, setRotasPadrao] = useState<RotaPadrao[]>([]);
  const [sugestoesRotas] = useState<RotaPadrao[]>([]);

  // Função auxiliar para mapear tipo_usuario para role
  const mapTipoUsuarioToRole = (tipoUsuario: string): 'admin' | 'operador' | 'visual' | 'pendente' => {
    switch (tipoUsuario) {
      case 'administrador':
        return 'admin';
      case 'operador':
        return 'operador';
      case 'visitante':
        return 'visual';
      case 'pendente':
        return 'pendente';
      default:
        return 'visual';
    }
  };

  // Verifica se há usuário salvo no localStorage ao inicializar
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          console.warn('⚠️ Supabase não está configurado corretamente');
          setLoading(false);
          return;
        }

        // Verifica se há usuário salvo no localStorage
        const savedUser = localStorage.getItem('current_user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            // Verifica se o usuário ainda existe no banco
            const { data: user } = await supabase
              .from('usuarios')
              .select('id, email, nome, tipo_usuario')
              .eq('id', userData.id)
              .single();
            
            if (user) {
              setUser({
                id: user.id,
                email: user.email,
                nome: user.nome,
                role: mapTipoUsuarioToRole(user.tipo_usuario)
              });
            } else {
              // Usuário não existe mais, remove do localStorage
              localStorage.removeItem('current_user');
            }
          } catch (error) {
            console.error('Erro ao restaurar sessão:', error);
            localStorage.removeItem('current_user');
          }
        }
      } catch (error) {
        console.error("❌ Auth init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (!user) return;
    try {
      const [clientesRes, fretistasRes, veiculosRes, motoristasRes, rotasRes] = await Promise.allSettled([
        supabase.from('clientes').select('*'),
        supabase.from('fretistas').select('*'),
        supabase.from('veiculos').select('*, fretistas(nome)'),
        supabase.from('motoristas').select('nome'),
        supabase.from('rotas').select(`*, fretistas(nome), veiculos(placa, tipo_veiculo), motoristas(nome), rota_clientes(cliente_id, ordem_entrega, status_entrega, comentario_entrega, clientes(nome)), mapa_carregamento(posicao_palete, clientes(nome))`).order('created_at', { ascending: false })
      ]);

      if (clientesRes.status === 'fulfilled' && clientesRes.value.data) setClientes(clientesRes.value.data);
      if (fretistasRes.status === 'fulfilled' && fretistasRes.value.data) setFretistas(fretistasRes.value.data);
      
      if (veiculosRes.status === 'fulfilled' && veiculosRes.value.data) {
        setVeiculos(veiculosRes.value.data.map((v: any) => ({
          placa: v.placa,
          tipo: v.tipo_veiculo,
          // @ts-ignore
          fretista: v.fretistas?.nome || 'Desconhecido',
          capacidade: v.capacidade_kg,
          motoristaPadrao: ''
        })));
      }

      if (motoristasRes.status === 'fulfilled' && motoristasRes.value.data) {
        setMotoristas(motoristasRes.value.data.map((m: any) => m.nome));
      }

      if (rotasRes.status === 'fulfilled' && rotasRes.value.data) {
        const mappedRotas: Rota[] = rotasRes.value.data.map((r: any) => {
          const clientesArr = Array(10).fill(null);
          const statusArr: ('Pendente' | 'Entregue' | 'Devolvida')[] = Array(10).fill('Pendente');
          const cargaSlotsArr: string[][] = [];
          const comentariosArr: (string | null)[] = Array(10).fill(null);
          // @ts-ignore
          if (r.rota_clientes) r.rota_clientes.forEach((rc: any) => {
             if (rc.ordem_entrega < 10) {
               // @ts-ignore
               if (rc.clientes) clientesArr[rc.ordem_entrega] = rc.clientes.nome;
               if (rc.status_entrega) statusArr[rc.ordem_entrega] = rc.status_entrega;
               if (typeof rc.comentario_entrega === 'string') comentariosArr[rc.ordem_entrega] = rc.comentario_entrega;
             }
          });
          if (r.mapa_carregamento) {
            r.mapa_carregamento.forEach((mc: any) => {
              const pos = (mc.posicao_palete || 1) - 1;
              if (!cargaSlotsArr[pos]) cargaSlotsArr[pos] = [];
              if (mc.clientes?.nome) cargaSlotsArr[pos].push(mc.clientes.nome);
            });
          }
          return {
            id: r.id,
            dataEntrega: r.data_entrega,
            regiao: r.regiao,
            numeroCarga: r.numero_carga,
            // @ts-ignore
            fretista: r.fretistas?.nome || '',
            // @ts-ignore
            placa: r.veiculos?.placa || '',
            // @ts-ignore
            motorista: r.motoristas?.nome || '',
            // @ts-ignore
            tipoVeiculo: r.veiculos?.tipo_veiculo || '',
            pesoCarga: r.peso_total,
            qtdPaletes: r.qtd_paletes,
            taxaOcupacao: r.taxa_ocupacao,
            clientes: clientesArr,
            entregaStatusByIndex: statusArr,
            entregaComentarioByIndex: comentariosArr,
            cargaSlots: cargaSlotsArr,
            observacoes: r.observacoes || '',
            status: r.status || 'Criada'
          } as Rota;
        });
        setRotas(mappedRotas);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // --- ACTIONS ---
  const addCliente = async (cliente: Omit<Cliente, 'id'>) => {
    await supabase.from('clientes').insert([cliente]);
    fetchData();
  };
  const removeCliente = async (id: string | number) => {
    await supabase.from('clientes').delete().eq('id', id);
    fetchData();
  };
  const addVeiculo = async (veiculo: VeiculoData & { motoristaPadrao?: string; contato?: string; capacidadePaletes?: number }) => {
    try {
      // 1. Buscar ou criar fretista
      let fretistaObj = fretistas.find(f => f.nome === veiculo.fretista);
      if (!fretistaObj) {
        const { data: newFretista, error: fretistaError } = await supabase
          .from('fretistas')
          .insert([{ nome: veiculo.fretista, contato: veiculo.contato || null }])
          .select()
          .single();
        
        if (fretistaError) throw fretistaError;
        fretistaObj = { id: newFretista.id, nome: newFretista.nome };
      }

      // 2. Criar veículo
      const { error: veiculoError } = await supabase
        .from('veiculos')
        .insert([{
          placa: veiculo.placa,
          tipo_veiculo: veiculo.tipo,
          capacidade_kg: veiculo.capacidade,
          capacidade_paletes: veiculo.capacidadePaletes || null,
          fretista_id: fretistaObj.id
        }]);

      if (veiculoError) throw veiculoError;
      // 3. Criar motorista se fornecido
      if (veiculo.motoristaPadrao) {
        const { data: existingMotorista } = await supabase
          .from('motoristas')
          .select('id')
          .eq('nome', veiculo.motoristaPadrao)
          .eq('fretista_id', fretistaObj.id)
          .single();

        if (!existingMotorista) {
          await supabase.from('motoristas').insert([{
            nome: veiculo.motoristaPadrao,
            fretista_id: fretistaObj.id
          }]);
        }
      }

      fetchData();
    } catch (error: any) {
      console.error("Erro ao cadastrar frota:", error);
      throw error;
    }
  };
  const removeVeiculo = async (placa: string) => {
    await supabase.from('veiculos').delete().eq('placa', placa);
    fetchData();
  };
  const addRegiao = (regiao: string) => setRegioes(prev => [...prev, regiao]);
  
  const addRota = async (rota: Omit<Rota, 'id'>) => {
    try {
      const { data: fData } = await supabase.from('fretistas').select('id').eq('nome', rota.fretista).single();
      const { data: vData } = await supabase.from('veiculos').select('id').eq('placa', rota.placa).single();
      
      let motoristaId = null;
      const { data: mData } = await supabase.from('motoristas').select('id').eq('nome', rota.motorista).single();
      if (mData) motoristaId = mData.id;
      else if (fData) {
         const { data: newM } = await supabase.from('motoristas').insert([{ nome: rota.motorista, fretista_id: fData.id }]).select().single();
         if (newM) motoristaId = newM.id;
      }

      if (vData && fData) {
        const { data: rotaInserted } = await supabase.from('rotas').insert([{
          data_entrega: rota.dataEntrega, regiao: rota.regiao, numero_carga: rota.numeroCarga,
          fretista_id: fData.id, veiculo_id: vData.id, motorista_id: motoristaId,
          peso_total: rota.pesoCarga, qtd_paletes: rota.qtdPaletes, taxa_ocupacao: rota.taxaOcupacao,
          observacoes: rota.observacoes
        }]).select().single();

        if (rotaInserted) {
           for (let i = 0; i < rota.clientes.length; i++) {
             if (rota.clientes[i]) {
               const { data: cData } = await supabase.from('clientes').select('id').eq('nome', rota.clientes[i]).single();
               if (cData) {
                 await supabase.from('rota_clientes').insert({ rota_id: rotaInserted.id, cliente_id: cData.id, ordem_entrega: i, status_entrega: 'Pendente', comentario_entrega: null });
               }
             }
           }
           if (rota.cargaSlots && rota.cargaSlots.length > 0) {
             for (let p = 0; p < rota.cargaSlots.length; p++) {
               const arr = rota.cargaSlots[p] || [];
               for (const nome of arr) {
                 if (!nome) continue;
                 const { data: cData } = await supabase.from('clientes').select('id').eq('nome', nome).single();
                 if (cData) {
                   await supabase.from('mapa_carregamento').insert({ rota_id: rotaInserted.id, posicao_palete: p + 1, cliente_id: cData.id });
                 }
               }
             }
           }
        }
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const updateEntregaStatus = async (rotaId: string, ordem: number, status: 'Pendente' | 'Entregue' | 'Devolvida') => {
    try {
      await supabase.from('rota_clientes').update({ status_entrega: status }).eq('rota_id', rotaId).eq('ordem_entrega', ordem);
      fetchData();
    } catch (e) {
      console.error('Erro ao atualizar status da entrega:', e);
    }
  };

  const updateEntregaComentario = async (rotaId: string, ordem: number, comentario: string) => {
    try {
      await supabase.from('rota_clientes').update({ comentario_entrega: comentario }).eq('rota_id', rotaId).eq('ordem_entrega', ordem);
      fetchData();
    } catch (e) {
      console.error('Erro ao atualizar comentário da entrega:', e);
    }
  };

  const seedDatabase = async () => {
    try {
      setLoading(true);
      // Fretistas
      const { data: existingFretistas } = await supabase.from('fretistas').select('nome');
      const existingNames = existingFretistas?.map((f: any) => f.nome) || [];
      const newFretistas = FRETISTAS.filter((f: any) => !existingNames.includes(f.nome)).map((f: any) => ({ nome: f.nome }));
      if (newFretistas.length > 0) await supabase.from('fretistas').insert(newFretistas);
      
      // Veículos
      const { data: allFretistas } = await supabase.from('fretistas').select('*');
      if (allFretistas) {
        const { data: existingPlacas } = await supabase.from('veiculos').select('placa');
        const existingPlacasList = existingPlacas?.map((v: any) => v.placa) || [];
        const newVeiculos = PLACAS.filter((p: any) => !existingPlacasList.includes(p.placa)).map((p: any) => {
          const fId = allFretistas.find((f: any) => f.nome === p.fretista)?.id;
          return fId ? { placa: p.placa, tipo_veiculo: p.tipo, capacidade_kg: p.capacidade, fretista_id: fId } : null;
        }).filter(Boolean);
        if (newVeiculos.length > 0) await supabase.from('veiculos').insert(newVeiculos);
      }

      // Clientes (Batch)
      const { data: existingClientes } = await supabase.from('clientes').select('codigo');
      const existingCodigos = existingClientes?.map(c => c.codigo) || [];
      const newClientes = CLIENTES.filter((c: any) => !existingCodigos.includes(c.codigo));
      const batchSize = 50;
      for (let i = 0; i < newClientes.length; i += batchSize) {
        const batch = newClientes.slice(i, i + batchSize).map((c: any) => ({
          codigo: c.codigo, nome: c.nome, rede: c.rede, vendedor: c.vendedor, cidade: c.cidade, uf: c.uf, bairro: c.bairro
        }));
        await supabase.from('clientes').insert(batch);
      }

      alert('Banco de dados populado com sucesso!');
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert('Erro ao popular banco: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const seedUsers = async () => {
    const usersToCreate = [
      { email: 'obedysdeveloper@gmail.com', pass: 'junio2019', nome: 'Obedys', tipo_usuario: 'administrador' },
      { email: 'beteste42@gmail.com', pass: 'junio2019', nome: 'Junio', tipo_usuario: 'administrador' },
      { email: 'obedysjr@gmail.com', pass: 'junio2019', nome: 'Jr', tipo_usuario: 'operador' },
      { email: 'obedys.ia@gmail.com', pass: 'junio2019', nome: 'ObedysIA', tipo_usuario: 'visitante' },
    ];
    let successCount = 0;
    let errorCount = 0;
    
    for (const u of usersToCreate) {
      try {
        // Verifica se o usuário já existe
        const { data: existingUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', u.email)
          .single();
        
        if (existingUser) {
          console.log(`Usuário ${u.email} já existe, pulando...`);
          continue;
        }
        
        // Usa a função create_user para criar o usuário com hash de senha
        const { data: userId, error } = await supabase
          .rpc('create_user', {
            email_input: u.email,
            senha_input: u.pass,
            nome_input: u.nome,
            tipo_usuario_input: u.tipo_usuario
          });
        
        if (error) {
          console.error(`Erro ao criar usuário ${u.email}:`, error);
          errorCount++;
        } else {
          console.log(`Usuário ${u.email} criado com sucesso (ID: ${userId})`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`Erro ao processar usuário ${u.email}:`, err);
        errorCount++;
      }
    }
    
    alert(`${successCount} usuários criados com sucesso. ${errorCount > 0 ? `${errorCount} erros.` : ''}`);
  };

  const addRotaPadrao = (rota: RotaPadrao) => setRotasPadrao(prev => [...prev, rota]);
  const gerarRoteiroDePadrao = (rotaPadrao: RotaPadrao, dataEntrega: string) => { console.log(rotaPadrao, dataEntrega) };
  
  const login = async (email: string, pass: string) => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured) {
        throw new Error('Supabase não configurado. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
      }

      if (!supabase) {
        throw new Error('Cliente Supabase não inicializado. Verifique a configuração do Supabase.');
      }

      console.log('🔄 Tentando fazer login...');
      
      // Usa a função verify_password para verificar email e senha
      const { data: userData, error } = await supabase
        .rpc('verify_password', {
          email_input: email,
          password_input: pass
        });

      if (error) {
        console.error("❌ Erro ao verificar credenciais:", error);
        throw new Error('Erro ao verificar credenciais. Tente novamente.');
      }

      // A função retorna uma TABLE, então userData pode ser um array ou um objeto único
      const user = Array.isArray(userData) ? (userData.length > 0 ? userData[0] : null) : userData;
      
      if (!user) {
        throw new Error('E-mail ou senha incorretos.');
      }
      
      // Define o usuário no estado
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: mapTipoUsuarioToRole(user.tipo_usuario)
      };

      setUser(userProfile);
      
      // Salva no localStorage para manter sessão
      localStorage.setItem('current_user', JSON.stringify({
        id: user.id,
        email: user.email,
        nome: user.nome,
        tipo_usuario: user.tipo_usuario
      }));

      console.log('✅ Login bem-sucedido');
    } catch (error: any) {
      console.error("❌ Erro no login:", error);
      
      if (error.message?.includes('E-mail ou senha incorretos')) {
        throw error;
      } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        throw new Error(error.message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Remove do localStorage
      localStorage.removeItem('current_user');
      
      setUser(null);
      setRotas([]);
      setClientes([]);
      setVeiculos([]);
      setFretistas([]);
      setMotoristas([]);
      
      // Redireciona para login
      window.location.href = '/login';
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, login, logout, updateEntregaStatus, updateEntregaComentario,
      clientes, veiculos, regioes, fretistas, motoristas, loading,
      addCliente, addVeiculo, addRegiao, removeCliente, removeVeiculo,
      rotas, addRota, rotasPadrao, addRotaPadrao, gerarRoteiroDePadrao, sugestoesRotas,
      theme, toggleTheme, veiculosTypes: VEICULOS_TYPES,
      seedDatabase, seedUsers
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
