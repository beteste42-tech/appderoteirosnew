import React from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import { User } from 'lucide-react';
 
const Profile = () => {
  const { user } = useApp();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader 
        title="Perfil do Usuário" 
        description="Aguarde a liberação do administrador para acessar as demais telas."
        icon={User}
      />
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold mb-2 tracking-wide">Nome</p>
        <p className="font-bold text-gray-900 dark:text-white text-xl">{user?.nome}</p>
        <p className="mt-4 text-xs text-gray-400">Tipo de acesso: {user?.role}</p>
      </div>
    </div>
  );
};
 
export default Profile;
