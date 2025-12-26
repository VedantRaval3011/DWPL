'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{title}</h1>
        {description && (
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
