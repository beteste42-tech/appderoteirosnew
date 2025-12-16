import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Routing from './pages/Routing';
import LoadingMap from './pages/LoadingMap';
import StandardRoutes from './pages/StandardRoutes';
import Settings from './pages/Settings';
import Register from './pages/Register';
import Resumo from './pages/Resumo';
import { Menu, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  if (loading) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const isConfigured = supabaseUrl && supabaseAnonKey;

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse mb-6">
          {isConfigured ? 'Carregando sistema...' : 'Configurando sistema...'}
        </p>
        
        {!isConfigured && (
          <div className="max-w-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium mb-2">
              ⚠️ Supabase não configurado
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-xs">
              Crie um arquivo <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">.env</code> na raiz do projeto com:
            </p>
            <pre className="text-xs bg-yellow-100 dark:bg-yellow-900 p-2 rounded mt-2 text-left overflow-x-auto">
{`VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui`}
            </pre>
          </div>
        )}
        
        <button 
          onClick={async () => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg transition-colors border border-red-200 dark:border-red-900"
        >
          <RefreshCw size={14} /> Demorando muito? Resetar Sistema
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900 font-sans transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className={cn("flex-1 flex flex-col min-w-0 transition-all duration-300", isSidebarOpen ? "lg:ml-72" : "lg:ml-0")}>        
        <header className="bg-primary dark:bg-slate-950 text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg">Roteiriza GDM</span>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

import Profile from './pages/Profile';

function AppRoutes() {
  const { user } = useApp();
  const isPendente = user?.role === 'pendente';
  const isVisual = user?.role === 'visual';
  const canEdit = user?.role === 'admin' || user?.role === 'operador';
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to={isPendente ? "/perfil" : "/rotas"} replace />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/rotas" element={isPendente ? <Navigate to="/perfil" replace /> : <Dashboard />} />
        <Route path="/roteirizacao" element={canEdit ? <Routing /> : <Navigate to={isPendente ? "/perfil" : "/rotas"} replace />} />
        <Route path="/mapa-carregamento" element={canEdit ? <LoadingMap /> : <Navigate to={isPendente ? "/perfil" : "/rotas"} replace />} />
        <Route path="/rotas-padrao" element={canEdit ? <StandardRoutes /> : <Navigate to={isPendente ? "/perfil" : "/rotas"} replace />} />
        <Route path="/configuracoes" element={canEdit ? <Settings /> : <Navigate to={isPendente ? "/perfil" : "/rotas"} replace />} />
        <Route path="/resumo" element={<Resumo />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
