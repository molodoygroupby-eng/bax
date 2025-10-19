import * as React from 'react';
import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-black text-white hover:bg-neutral-800 focus:ring-black',
    secondary:
      'bg-white text-black border border-neutral-200 hover:bg-neutral-50 focus:ring-neutral-200',
    ghost: 'bg-transparent hover:bg-neutral-100 text-black',
  } as const;
  return <button className={clsx(base, variants[variant], className)} {...props} />;
};
