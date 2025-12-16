import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Truck, Settings, LogOut, MapPin, X, Moon, Sun, UserCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, theme, toggleTheme, user } = useApp();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/rotas' },
    { icon: Map, label: 'Roteirização', path: '/roteirizacao' },
    { icon: Truck, label: 'Mapa de Carga', path: '/mapa-carregamento' },
    { icon: MapPin, label: 'Rotas Padrão', path: '/rotas-padrao' },
    { icon: LayoutDashboard, label: 'Resumo', path: '/resumo' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* Header com Logo */}
        <div className="p-8 flex flex-col items-center border-b border-gray-100 dark:border-slate-800 bg-primary/5 dark:bg-slate-900">
          <Logo className="mb-4" size="md" />
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="mx-4 mt-6 p-4 bg-primary/10 dark:bg-slate-800 rounded-xl flex items-center gap-3 border border-primary/20">
            <div className="bg-primary text-white p-2 rounded-full">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-800 dark:text-white text-sm truncate">{user.nome}</p>
              <p className="text-xs text-primary dark:text-primary-light font-medium uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/30 font-bold" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className={cn(isActive ? "text-white" : "group-hover:text-primary")} />
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2 bg-gray-50 dark:bg-slate-900/50">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="font-medium text-sm">
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Sair do Sistema</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
