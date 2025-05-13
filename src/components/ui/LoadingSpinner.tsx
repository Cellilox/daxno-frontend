import React from 'react';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function LoadingSpinner({
  className = '',
  ...rest
}: LoadingSpinnerProps) {
  return (
    <div
      className={`spinner ${className}`.trim()}
      {...rest}
    />
  );
}