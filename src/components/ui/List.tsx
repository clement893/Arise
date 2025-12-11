'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * List variants
 */
const listVariants = cva(
  ['divide-y divide-neutral-200'],
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-neutral-200 rounded-lg overflow-hidden',
        card: 'bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden',
      },
      spacing: {
        none: '',
        sm: '[&>*]:py-2',
        md: '[&>*]:py-3',
        lg: '[&>*]:py-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'md',
    },
  }
);

interface ListProps
  extends HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof listVariants> {
  children: ReactNode;
  /** Accessible label for the list */
  ariaLabel?: string;
}

/**
 * List component - Container for list items
 */
const List = forwardRef<HTMLUListElement, ListProps>(
  ({ variant, spacing, children, ariaLabel, className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        role="list"
        aria-label={ariaLabel}
        className={cn(listVariants({ variant, spacing }), className)}
        {...props}
      >
        {children}
      </ul>
    );
  }
);

List.displayName = 'List';

/**
 * ListItem variants
 */
const listItemVariants = cva(
  ['px-4 transition-colors duration-200'],
  {
    variants: {
      interactive: {
        true: 'hover:bg-neutral-50 cursor-pointer',
        false: '',
      },
      selected: {
        true: 'bg-primary-50 border-l-2 border-l-primary-500',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
      selected: false,
    },
  }
);

interface ListItemProps
  extends HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof listItemVariants> {
  children: ReactNode;
  /** Left side content (icon, avatar, etc.) */
  leading?: ReactNode;
  /** Right side content (badge, action, etc.) */
  trailing?: ReactNode;
}

/**
 * ListItem component - Individual list item
 */
const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  ({ interactive, selected, children, leading, trailing, className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(listItemVariants({ interactive, selected }), className)}
        {...props}
      >
        <div className="flex items-center gap-3">
          {leading && <div className="flex-shrink-0">{leading}</div>}
          <div className="flex-1 min-w-0">{children}</div>
          {trailing && <div className="flex-shrink-0">{trailing}</div>}
        </div>
      </li>
    );
  }
);

ListItem.displayName = 'ListItem';

/**
 * ListItemText - Text content for list items
 */
interface ListItemTextProps extends HTMLAttributes<HTMLDivElement> {
  primary: ReactNode;
  secondary?: ReactNode;
}

const ListItemText = forwardRef<HTMLDivElement, ListItemTextProps>(
  ({ primary, secondary, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('min-w-0', className)} {...props}>
        <p className="text-sm font-medium text-neutral-900 truncate">{primary}</p>
        {secondary && (
          <p className="text-sm text-neutral-500 truncate">{secondary}</p>
        )}
      </div>
    );
  }
);

ListItemText.displayName = 'ListItemText';

/**
 * DataList - Key-value pair list for displaying data
 */
interface DataListProps extends HTMLAttributes<HTMLDListElement> {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

const DataList = forwardRef<HTMLDListElement, DataListProps>(
  ({ children, columns = 1, className, ...props }, ref) => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    };

    return (
      <dl
        ref={ref}
        className={cn('grid gap-4', columnClasses[columns], className)}
        {...props}
      >
        {children}
      </dl>
    );
  }
);

DataList.displayName = 'DataList';

/**
 * DataListItem - Individual key-value pair
 */
interface DataListItemProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  /** Show as inline (label and value on same line) */
  inline?: boolean;
}

const DataListItem = forwardRef<HTMLDivElement, DataListItemProps>(
  ({ label, value, inline = false, className, ...props }, ref) => {
    if (inline) {
      return (
        <div ref={ref} className={cn('flex items-center justify-between py-2', className)} {...props}>
          <dt className="text-sm text-neutral-500">{label}</dt>
          <dd className="text-sm font-medium text-neutral-900">{value}</dd>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        <dt className="text-sm text-neutral-500">{label}</dt>
        <dd className="text-sm font-medium text-neutral-900">{value}</dd>
      </div>
    );
  }
);

DataListItem.displayName = 'DataListItem';

/**
 * EmptyState - Placeholder for empty lists
 */
interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
        {...props}
      >
        {icon && (
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-500 max-w-sm mb-4">{description}</p>
        )}
        {action}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export {
  List,
  ListItem,
  ListItemText,
  DataList,
  DataListItem,
  EmptyState,
  listVariants,
  listItemVariants,
};
export default List;

export type { ListProps, ListItemProps };
