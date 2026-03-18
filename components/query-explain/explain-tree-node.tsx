'use client';

import type { QueryExplainDetailNode } from '@/types';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  node: QueryExplainDetailNode;
  depth?: number;
}

export function ExplainTreeNode({ node, depth = 0 }: Props) {
  const hasChildren = node.children && node.children.length > 0;
  const [open, setOpen] = useState(depth === 0);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'rounded-xl border border-slate-200 transition-colors hover:border-slate-300',
          depth === 0 ? 'bg-white shadow-sm' : 'bg-slate-50/70'
        )}
      >
        <div className="flex items-start gap-3 p-4">
          <button
            type="button"
            className="mt-0.5 shrink-0 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
            onClick={() => hasChildren && setOpen((v) => !v)}
            disabled={!hasChildren}
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-300 ease-out',
                open && hasChildren && 'rotate-90'
              )}
            />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-900">{node.label}</span>
              {typeof node.value === 'number' && (
                <span className="rounded-md bg-blue-50 px-2.5 py-1 font-mono text-xs font-medium text-blue-700">
                  {node.value.toFixed(4)}
                </span>
              )}
            </div>

            {open && node.description && (
              <div className="mt-2 break-words font-mono text-xs leading-5 text-slate-500">
                {node.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasChildren && (
        <div
          className={cn(
            'grid transition-all duration-300 ease-out',
            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="ml-6 space-y-2 border-l border-slate-200 pl-4 pt-1">
              {node.children.map((child, idx) => (
                <ExplainTreeNode key={`${child.key}-${idx}`} node={child} depth={depth + 1} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}