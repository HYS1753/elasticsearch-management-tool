import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeadingProps {
  icon?: LucideIcon;
  title: string;
  description: string;
}

export function SectionHeading({ icon: Icon, title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-blue-600" />}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
      </div>
      <p className={`text-sm text-slate-600 dark:text-slate-400 ${Icon ? 'ml-7' : ''}`}>{description}</p>
    </div>
  );
}
