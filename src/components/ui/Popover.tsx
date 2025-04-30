'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Simple custom Popover implementation without Radix UI
interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Popover: React.FC<PopoverProps> = ({
  children,
  open: controlledOpen,
  onOpenChange
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === PopoverTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => handleOpenChange(!open),
            });
          }
          if (child.type === PopoverContent) {
            return open ? child : null;
          }
        }
        return child;
      })}
    </div>
  );
};

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  onClick?: () => void;
}

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({
  children,
  asChild,
  onClick
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onClick?.();
        // Also call the original onClick if it exists
        if (typeof children.props.onClick === 'function') {
          children.props.onClick(e);
        }
      },
      type: children.props.type || 'button', // Ensure button has type
    });
  }

  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
};

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  [key: string]: any;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = 'center', sideOffset = 4, children, ...props }, ref) => {
    const alignClass = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    }[align];

    return (
      <div
        ref={ref}
        className={cn(
          'absolute top-full mt-2',
          alignClass,
          'z-50 w-72 rounded-md border border-slate-200 bg-white p-4 shadow-md outline-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
