'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Activity,
  Database,
  FileJson,
  GitBranch,
  HardDrive,
  Layers3,
  Search,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

import { getIndexDetail } from '@/lib/client-api/indices';
import type {
  IndexAliasItem,
  IndexDetailData,
  IndexMappingField,
  IndexSettingItem,
} from '@/types/index-detail';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/common/error-display';

function formatNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '-';

  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  if (Number.isNaN(parsed)) return String(value);

  return parsed.toLocaleString();
}

function formatBytes(bytes?: number | null) {
  if (bytes === null || bytes === undefined) return '-';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function getHealthBadgeClass(health?: string) {
  switch (health) {
    case 'green':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'yellow':
      return 'border-yellow-200 bg-yellow-50 text-yellow-700';
    case 'red':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

function getStatusBadgeClass(status?: string) {
  const normalized = status === 'close' ? 'closed' : status;

  switch (normalized) {
    case 'open':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'closed':
      return 'border-slate-200 bg-slate-100 text-slate-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </CardContent>
    </Card>
  );
}

function AliasTable({ aliases }: { aliases: IndexAliasItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aliases</CardTitle>
        <CardDescription>인덱스에 연결된 alias 정보입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Alias</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Write Index</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Index Routing</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Search Routing</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Filter</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {aliases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      alias가 없습니다.
                    </td>
                  </tr>
                ) : (
                  aliases.map((alias) => (
                    <tr key={alias.name} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">{alias.name}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {alias.is_write_index ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            true
                          </Badge>
                        ) : (
                          <Badge variant="secondary">false</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{alias.routing_index || '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{alias.routing_search || '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div className="max-w-[420px] whitespace-pre-wrap break-all rounded-xl bg-slate-50 p-3">
                          {alias.filter || '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsSection({ settings }: { settings: IndexSettingItem[] }) {
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return settings;

    return settings.filter(
      (item) =>
        item.key.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q)
    );
  }, [settings, keyword]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>flat settings 기준으로 정렬된 설정 목록입니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="setting key/value 검색"
            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="max-h-[520px] overflow-auto rounded-2xl border border-slate-200">
          <div className="divide-y divide-slate-100 bg-white">
            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                조건에 맞는 setting이 없습니다.
              </div>
            ) : (
              filtered.map((item) => (
                <div key={item.key} className="grid gap-2 px-4 py-3 lg:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="text-sm break-all font-medium text-slate-900">{item.key}</div>
                  <div className="text-sm break-all text-slate-600">{item.value}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MappingNode({
  field,
  level = 0,
}: {
  field: IndexMappingField;
  level?: number;
}) {
  const [open, setOpen] = useState(level < 1);
  const hasChildren = field.children.length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setOpen((prev) => !prev)}
        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50 ${
          level > 0 ? 'ml-4' : ''
        }`}
      >
        <div className="flex h-5 w-5 items-center justify-center text-slate-500">
          {hasChildren ? (
            open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-slate-900">{field.name}</div>
        </div>

        <Badge variant="outline" className="shrink-0">
          {field.type}
        </Badge>
      </button>

      {hasChildren && open && (
        <div className="mt-1 space-y-1">
          {field.children.map((child) => (
            <MappingNode key={child.name} field={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function MappingsSection({ mappings }: { mappings: IndexMappingField[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mappings</CardTitle>
        <CardDescription>필드 구조를 트리 형태로 확인합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[640px] overflow-auto rounded-2xl border border-slate-200 bg-white p-3">
          {mappings.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              mapping field가 없습니다.
            </div>
          ) : (
            <div className="space-y-1">
              {mappings.map((field) => (
                <MappingNode key={field.name} field={field} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function IndexDetailView({ indexName }: { indexName: string }) {
  const [data, setData] = useState<IndexDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getIndexDetail(indexName);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load index detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [indexName]);

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={load}
      />
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-[320px] w-full" />
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-[420px] w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    );
  }

  const { summary, aliases, settings, mappings, stats } = data;

  return (
    <div className="space-y-6">
      <Card className="border-sky-200/60 bg-gradient-to-r from-sky-50 to-white">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/indices"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Indices
            </Link>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">{summary.index}</h1>
                <Badge variant="outline" className={getHealthBadgeClass(summary.health)}>
                  {summary.health || 'unknown'}
                </Badge>
                <Badge variant="outline" className={getStatusBadgeClass(summary.status)}>
                  {summary.status === 'close' ? 'closed' : summary.status || 'unknown'}
                </Badge>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                인덱스 기본 정보, aliases, settings, mappings, stats를 한 화면에서 확인합니다.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={load}>
            Refresh Detail
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Documents"
          value={formatNumber(stats.docs_count)}
          description="총 문서 수"
          icon={Database}
        />
        <StatsCard
          title="Deleted Docs"
          value={formatNumber(stats.docs_deleted)}
          description="삭제 문서 수"
          icon={Shield}
        />
        <StatsCard
          title="Store Size"
          value={formatBytes(stats.store_size_in_bytes)}
          description="전체 스토리지"
          icon={HardDrive}
        />
        <StatsCard
          title="Primary Store"
          value={formatBytes(stats.primary_store_size_in_bytes)}
          description="primary 스토리지"
          icon={Layers3}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>cat indices 및 stats 기준 요약 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryItem label="Index" value={summary.index} />
          <SummaryItem label="UUID" value={summary.uuid} />
          <SummaryItem label="Primary Shards" value={summary.pri || '-'} />
          <SummaryItem label="Replicas" value={summary.rep || '-'} />
          <SummaryItem label="Docs Count" value={formatNumber(summary.docs_count)} />
          <SummaryItem label="Deleted Docs" value={formatNumber(summary.docs_deleted)} />
          <SummaryItem label="Store Size" value={summary.store_size || '-'} />
          <SummaryItem label="Primary Store Size" value={summary.pri_store_size || '-'} />
          <SummaryItem label="Dataset Size" value={summary.dataset_size || '-'} />
          <SummaryItem label="Search Query Total" value={formatNumber(stats.search_query_total)} />
          <SummaryItem label="Indexing Total" value={formatNumber(stats.indexing_index_total)} />
          <SummaryItem
            label="Status"
            value={summary.status === 'close' ? 'closed' : summary.status || 'unknown'}
          />
        </CardContent>
      </Card>

      <AliasTable aliases={aliases} />

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsSection settings={settings} />
        <MappingsSection mappings={mappings} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>다음 단계 후보</CardTitle>
          <CardDescription>이 상세 화면에서 바로 이어서 붙일 수 있는 운영 기능들입니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Activity className="h-4 w-4" />
              <span className="font-medium">Open / Close</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              인덱스 운영 상태를 제어하는 액션
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center gap-2 text-slate-900">
              <GitBranch className="h-4 w-4" />
              <span className="font-medium">Alias Actions</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              alias 추가/삭제 및 write index 제어
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center gap-2 text-slate-900">
              <FileJson className="h-4 w-4" />
              <span className="font-medium">Readonly Toggle</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              주요 settings 변경 액션
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Activity className="h-4 w-4" />
              <span className="font-medium">Refresh / Flush</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              운영성 API 액션 확장
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}