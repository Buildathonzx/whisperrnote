import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label 
      className={`text-sm font-medium text-light-700 dark:text-dark-300 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}