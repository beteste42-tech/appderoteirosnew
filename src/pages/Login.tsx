import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, Loader2, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { seedUsers, isAuthenticated, login, user } = useApp();
  const navigate = useNavigate();

  // Se já estiver autenticado, redireciona para o dashboard
  useEffect(() => {
    // #region agent log
    const logData = {location:'Login.tsx:15',message:'isAuthenticated check in useEffect',data:{isAuthenticated,hasUser:!!user,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
    console.log('🔍 DEBUG LOG:', logData);
    fetch('http://127.0.0.1:7242/ingest/37cc7752-b3c6-49b0-9131-ea0a99123884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    // #endregion
    if (user) {
      // #region agent log
      const logData2 = {location:'Login.tsx:19',message:'user exists in useEffect, navigating',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
      console.log('🔍 DEBUG LOG:', logData2);
      fetch('http://127.0.0.1:7242/ingest/37cc7752-b3c6-49b0-9131-ea0a99123884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
      // #endregion
      navigate('/rotas');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // #region agent log
      const logData1 = {location:'Login.tsx:33',message:'calling login function',data:{email,isAuthenticatedBefore:isAuthenticated,hasUserBefore:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
      console.log('🔍 DEBUG LOG:', logData1);
      fetch('http://127.0.0.1:7242/ingest/37cc7752-b3c6-49b0-9131-ea0a99123884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData1)}).catch(()=>{});
      // #endregion
      // Usamos a função login do contexto que garante o carregamento do perfil
      await login(email, password);
      
      // #region agent log
      const logData2 = {location:'Login.tsx:37',message:'login function returned',data:{isAuthenticatedAfter:isAuthenticated,hasUserAfter:!!user,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
      console.log('🔍 DEBUG LOG:', logData2);
      fetch('http://127.0.0.1:7242/ingest/37cc7752-b3c6-49b0-9131-ea0a99123884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
      // #endregion
      
      // Usa user diretamente ao invés de isAuthenticated para evitar problemas de closure
      // Aguarda um pouco para garantir que o estado foi atualizado antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // #region agent log
      const logData3 = {location:'Login.tsx:42',message:'after delay checking user state',data:{isAuthenticated,hasUser:!!user,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
      console.log('🔍 DEBUG LOG:', logData3);
      fetch('http://127.0.0.1:7242/ingest/37cc7752-b3c6-49b0-9131-ea0a99123884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
      // #endregion
      
      // Verifica usando user diretamente para evitar problemas de closure
      if (user) {
        // #region agent log
        const logData4 = {location:'Login.tsx:46',message:'user exists, navigating',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
        console.log('🔍 DEBUG LOG:', logData4);
        fetch('http://127.0.0.1:7242/ingest/37cc7752-b3c6-49b0-9131-ea0a99123884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch(()=>{});
        // #endregion
        navigate('/rotas');
      } else {
        // #region agent log
        const logData5 = {location:'Login.tsx:50',message:'user is null, not navigating',data:{isAuthenticated,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
        console.log('🔍 DEBUG LOG:', logData5);
        fetch('http://127.0.0.1:7242/ingest/37cc7752-b3c6-49b0-9131-ea0a99123884',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData5)}).catch(()=>{});
        // #endregion
        setError('Erro: Usuário não foi carregado após login. Tente novamente.');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (err.message === 'Invalid login credentials' || err.message?.includes('Invalid login')) {
        errorMessage = 'E-mail ou senha incorretos.';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, confirme seu e-mail antes de fazer login.';
      } else if (err.message?.includes('Supabase não configurado') || err.message?.includes('variáveis de ambiente')) {
        errorMessage = '⚠️ Erro de configuração: Verifique se as variáveis do Supabase estão configuradas no arquivo .env';
      } else if (err.message?.includes('Timeout') || err.message?.includes('TIMEOUT_CONNECTION') || err.message?.includes('conexão') || err.message?.includes('network') || err.message?.includes('não está respondendo')) {
        errorMessage = err.message || '❌ Erro de conexão. Verifique sua internet, as configurações do Supabase no arquivo .env e tente novamente.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSeedUsers = async () => {
    if (confirm('Isso tentará criar os 4 usuários padrão. Continuar?')) {
      setLoading(true);
      await seedUsers();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-400 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-white/20">
        
        {/* Header */}
        <div className="bg-primary-dark p-8 flex flex-col items-center justify-center border-b border-white/10 relative">
           {/* Logo Container - Redondo e Branco */}
           <div className="bg-gray-900 p-4 rounded-full mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300 w-32 h-32 max-w-[128px] flex items-center justify-center">
             <img 
               src="https://i.ibb.co/k60bpVDz/grupo-docemel-logo-removebg-preview.png" 
               alt="Grupo Docemel"
               className="w-full h-auto object-contain"
             />
           </div>
           <h2 className="text-white text-xl font-bold tracking-wider">ACESSO RESTRITO</h2>
           <p className="text-white/60 text-sm">Sistema de Roteirização Inteligente</p>
        </div>

        <div className="p-8 pt-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="seu.nome@grupodocemel.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/30 text-sm font-bold text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'ENTRAR NO SISTEMA'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
            <button 
              onClick={handleSeedUsers}
              className="text-xs text-gray-400 hover:text-primary underline decoration-dotted"
            >
              Primeiro Acesso? Restaurar Usuários Padrão
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-white/40 text-xs text-center">
        &copy; 2025 Grupo Docemel • Tecnologia & Logística
      </div>
    </div>
  );
};

export default Login;
