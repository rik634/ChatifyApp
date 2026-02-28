import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  online 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <User className="w-2/3 h-2/3 text-gray-500" />
        )}
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            online ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
};