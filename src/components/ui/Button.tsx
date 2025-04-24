import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', isLoading = false, disabled, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);

    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: `bg-pink-600 text-white hover:bg-pink-700 focus-visible:ring-pink-500 ${isPressed ? 'transform translate-y-0.5 shadow-inner bg-pink-800' : 'shadow-sm'}`,
      secondary: `bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500 ${isPressed ? 'transform translate-y-0.5 shadow-inner bg-gray-300' : 'shadow-sm'}`,
      outline: `border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500 ${isPressed ? 'transform translate-y-0.5 shadow-inner bg-gray-200' : 'shadow-sm'}`,
      ghost: `bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500 ${isPressed ? 'transform translate-y-0.5 shadow-inner bg-gray-200' : ''}`,
      danger: `bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 ${isPressed ? 'transform translate-y-0.5 shadow-inner bg-red-800' : 'shadow-sm'}`,
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-11 px-6',
    };

    const handleMouseDown = () => {
      setIsPressed(true);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      if (isPressed) {
        setIsPressed(false);
      }
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'opacity-70 cursor-not-allowed',
          className
        )}
        disabled={isLoading || disabled}
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
