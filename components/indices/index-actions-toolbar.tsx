'use client';

import { useMemo, useState } from 'react';
import {
  Lock,
  LockOpen,
  RefreshCw,
  Trash2,
  FolderOpen,
  FolderClosed,
  Layers3,
  DatabaseZap,
} from 'lucide-react';

import type { ExecuteIndexActionRequest, IndexActionType } from '@/types/index-action';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ActionItem {
  label: string;
  action: IndexActionType;
  payload: ExecuteIndexActionRequest;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  dangerous?: boolean;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  selectedCount: number;
  loading?: boolean;
  onExecute: (payload: ExecuteIndexActionRequest) => Promise<void>;
}

export function IndexActionsToolbar({
  selectedCount,
  loading = false,
  onExecute,
}: Props) {
  const [executingAction, setExecutingAction] = useState<string | null>(null);

  const actionItems = useMemo<ActionItem[]>(
    () => [
      {
        label: 'Open',
        action: 'open',
        payload: { action: 'open' },
        variant: 'secondary',
        description: '선택한 인덱스를 open 상태로 전환합니다.',
        icon: FolderOpen,
      },
      {
        label: 'Close',
        action: 'close',
        payload: { action: 'close' },
        variant: 'secondary',
        dangerous: true,
        description:
          '선택한 인덱스를 close 상태로 전환합니다. 검색 및 쓰기 작업에 영향이 있을 수 있습니다.',
        icon: FolderClosed,
      },
      {
        label: 'Refresh Index',
        action: 'refresh',
        payload: { action: 'refresh' },
        variant: 'secondary',
        description: '선택한 인덱스에 refresh를 수행합니다.',
        icon: RefreshCw,
      },
      {
        label: 'Flush Index',
        action: 'flush',
        payload: { action: 'flush' },
        variant: 'secondary',
        description: '선택한 인덱스에 flush를 수행합니다.',
        icon: DatabaseZap,
      },
      {
        label: 'Force merge',
        action: 'forcemerge',
        payload: { action: 'forcemerge', max_num_segments: 1 },
        variant: 'secondary',
        dangerous: true,
        description:
          '선택한 인덱스에 force merge를 수행합니다. 운영 비용이 큰 작업이므로 주의해서 사용하세요.',
        icon: Layers3,
      },
      {
        label: 'Delete',
        action: 'delete',
        payload: { action: 'delete' },
        variant: 'destructive',
        dangerous: true,
        description:
          '선택한 인덱스를 삭제합니다. 삭제된 데이터는 복구할 수 없습니다.',
        icon: Trash2,
      },
    ],
    []
  );

  const runAction = async (item: ActionItem) => {
    try {
      setExecutingAction(item.label);
      await onExecute(item.payload);
    } finally {
      setExecutingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="text-sm text-slate-600">
        선택된 인덱스{' '}
        <span className="font-semibold text-slate-900">{selectedCount}</span>개
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {actionItems.map((item) => {
          const Icon = item.icon;
          const disabled = loading || selectedCount === 0 || executingAction !== null;

          const button = (
            <Button
              key={item.label}
              variant={item.variant ?? 'outline'}
              disabled={disabled}
              onClick={!item.dangerous ? () => runAction(item) : undefined}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {executingAction === item.label ? `${item.label}...` : item.label}
            </Button>
          );

          if (!item.dangerous) {
            return button;
          }

          return (
            <AlertDialog key={item.label}>
              <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{item.label} 실행 확인</AlertDialogTitle>
                  <AlertDialogDescription>
                    {item.description}
                    <br />
                    <br />
                    선택된 대상: <strong>{selectedCount}</strong>개 인덱스
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => runAction(item)}>
                    실행
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        })}
      </div>
    </div>
  );
}