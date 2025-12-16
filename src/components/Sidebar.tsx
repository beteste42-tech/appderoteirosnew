import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Truck, MapPin, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/rotas' },
    { icon: Map, label: 'Roteirização', path: '/roteirizacao' },
    { icon: Truck, label: 'Mapa de Carga', path: '/mapa-carregamento' },
    { icon: MapPin, label: 'Rotas Padrão', path: '/rotas-padrao' },
    { icon: LayoutDashboard, label: 'Resumo', path: '/resumo' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  return (
    <aside className={cn('fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 w-72 border-r dark:border-slate-800 transform transition-transform', isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
      <div className="p-4 border-b dark:border-slate-800">
        <span className="font-bold">Roteiriza GDM</span>
      </div>
      <nav className="p-2 space-y-1">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <NavLink key={path} to={path} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800', isActive && 'bg-primary/10 text-primary font-semibold') }>
            {({ isActive }) => <Icon size={20} className={cn('text-gray-500', isActive && 'text-primary')} />}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
