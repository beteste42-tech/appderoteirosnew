import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'white' | 'color';
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, variant = 'color', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-20',
    lg: 'h-28'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img 
        src="https://i.ibb.co/Hp2fcxR1/grupo-docemel-logo-square.png" 
        alt="Grupo Docemel"
        className={cn(
          sizeClasses[size], 
          "w-auto object-contain",
          // Nota: Como a logo é uma imagem oficial colorida, evitamos inverter as cores (filtro)
          // para manter a identidade visual correta. O controle de contraste deve ser feito no container.
          "drop-shadow-sm"
        )}
      />
    </div>
  );
};

export default Logo;
