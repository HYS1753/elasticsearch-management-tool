'use client';

/**
 * EnvironmentBadge — 현재 배포 환경(개발/검증/운영)을 시각적으로 구분하는 뱃지.
 * 
 * env: NEXT_PUBLIC_APP_PROFILE
 *   - "dev"  | "development"  → 개발계 (파란색)
 *   - "stg"  | "staging"      → 검증계 (주황색)
 *   - "prod" | "production"   → 운영계 (빨간색)
 *   - 미설정 또는 기타          → LOCAL (회색)
 *
 * 운영계(prod)일 때는 특히 강렬한 빨간색 + 아이콘으로 주의를 환기시켜
 * 휴먼에러를 방지합니다.
 */

import { AlertTriangle } from 'lucide-react';

type ProfileConfig = {
  label: string;
  labelKo: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  pulse?: boolean;
};

const PROFILE_MAP: Record<string, ProfileConfig> = {
  dev: {
    label: 'DEV',
    labelKo: '개발',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-500/30',
    dot: 'bg-sky-500',
  },
  development: {
    label: 'DEV',
    labelKo: '개발',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-500/30',
    dot: 'bg-sky-500',
  },
  stg: {
    label: 'STG',
    labelKo: '검증',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
  staging: {
    label: 'STG',
    labelKo: '검증',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
  prod: {
    label: 'PROD',
    labelKo: '운영',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-500/40',
    dot: 'bg-rose-500',
    pulse: true,
  },
  production: {
    label: 'PROD',
    labelKo: '운영',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-500/40',
    dot: 'bg-rose-500',
    pulse: true,
  },
};

const LOCAL_CONFIG: ProfileConfig = {
  label: 'LOCAL',
  labelKo: '로컬',
  bg: 'bg-slate-100 dark:bg-slate-800',
  text: 'text-slate-600 dark:text-slate-400',
  border: 'border-slate-200 dark:border-slate-700',
  dot: 'bg-slate-400',
};

interface EnvironmentBadgeProps {
  /** 로그인 페이지 등 밝은 배경 위에서 사용할 때 variant 변경 */
  variant?: 'default' | 'light-bg';
}

export function EnvironmentBadge({ variant = 'default' }: EnvironmentBadgeProps) {
  const profile = (process.env.NEXT_PUBLIC_APP_PROFILE || '').toLowerCase().trim();
  const config = PROFILE_MAP[profile] || LOCAL_CONFIG;
  const isProd = profile === 'prod' || profile === 'production';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider select-none transition-colors duration-200 ${config.bg} ${config.text} ${config.border}`}
    >
      {/* 운영계일 때 경고 아이콘 */}
      {isProd && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}

      {/* 상태 점 (운영계는 pulse 애니메이션) */}
      {!isProd && (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          {config.pulse && (
            <span className={`absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75 animate-ping`} />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
        </span>
      )}

      <span>{config.label}</span>
      <span className="font-medium opacity-60">·</span>
      <span className="font-medium text-[10px] normal-case">{config.labelKo}</span>
    </div>
  );
}
