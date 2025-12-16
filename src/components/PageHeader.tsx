import { ReactNode } from 'react';
export default function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h1>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}
