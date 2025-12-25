import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-10 text-center">
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: '#fff8ed' }}
      >
        {icon}
      </div>
      <h3 className="mb-2 font-medium text-gray-900">{title}</h3>
      {description && <p className="mb-5 text-sm text-gray-500">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
