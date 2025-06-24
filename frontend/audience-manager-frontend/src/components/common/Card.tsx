import React from 'react';

interface CardProps {
  title?: string;
  value?: string | number;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  value,
  description,
  className = '',
  children,
}) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      {title && (
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">
        {value && <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>}
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
};

export default Card;
