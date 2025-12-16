import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface User { id: string; role: 'admin'|'operador'|'visual'|'pendente'; }

interface AppState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppState>({ user: null, loading: true, isAuthenticated: false });
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ user: null, loading: true, isAuthenticated: false });

  useEffect(() => {
    const timer = setTimeout(() => {
      setState({ user: { id: '1', role: 'admin' }, loading: false, isAuthenticated: true });
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}
