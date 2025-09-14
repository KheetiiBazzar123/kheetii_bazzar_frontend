import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';

// SelectTrigger is now just an alias for Select to maintain API compatibility
const SelectTrigger = Select;
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<HTMLOptionElement, { children: React.ReactNode; value: string; className?: string }>(
  ({ className, children, value, ...props }, ref) => {
    return (
      <option
        ref={ref}
        value={value}
        className={cn(
          'relative flex w-full cursor-primary select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </option>
    );
  }
);
SelectItem.displayName = 'SelectItem';

const SelectValue = React.forwardRef<HTMLOptionElement, { placeholder?: string; className?: string }>(
  ({ className, placeholder, ...props }, ref) => {
    return (
      <option
        ref={ref}
        value=""
        className={cn('block truncate', className)}
        {...props}
      >
        {placeholder}
      </option>
    );
  }
);
SelectValue.displayName = 'SelectValue';

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
