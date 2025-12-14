import React from 'react';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  className?: string;
  rightAction?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  className,
  rightAction 
}) => {
  return (
    <div className={cn(
      "bg-primary text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-xl border border-primary-light",
      className
    )}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Icon size={32} className="text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-primary-foreground/80 text-sm md:text-base mt-1 font-medium opacity-90">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {rightAction && (
        <div className="w-full md:w-auto">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
