// UI Components Library for ARISE
// Import these components instead of copy-pasting code

// Button
export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// Card
export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './Card';

// Badge
export { default as Badge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';

// Modal
export { default as Modal, ConfirmModal } from './Modal';
export type { ModalProps, ConfirmModalProps, ModalSize } from './Modal';

// Input
export { default as Input } from './Input';
export type { InputProps } from './Input';

// Select
export { default as Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

// Spinner & Loading
export { 
  default as Spinner, 
  LoadingPage, 
  LoadingInline, 
  Skeleton 
} from './Spinner';
export type { SpinnerProps, SpinnerSize, SpinnerColor, LoadingPageProps, SkeletonProps } from './Spinner';

// Avatar
export { default as Avatar, AvatarGroup } from './Avatar';
export type { AvatarProps, AvatarSize, AvatarGroupProps } from './Avatar';

// StatCard
export { default as StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

// Table
export { Table, TableHeader, TableBody, TableRow, TableCell, TableHead, TableEmpty } from './Table';
export type { TableProps, TableHeaderProps, TableBodyProps, TableRowProps, TableHeadProps, TableCellProps, TableEmptyProps } from './Table';

// Tabs
export { default as Tabs, TabPanel, useTabs } from './Tabs';
export type { TabsProps, Tab, TabPanelProps } from './Tabs';
