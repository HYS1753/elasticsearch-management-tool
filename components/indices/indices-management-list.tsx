'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  Database,
  HardDrive,
  FileText,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

import { fetchIndicesList } from '@/lib/api/indices';
import type { IndexListItem } from '@/types/indices-list';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ErrorDisplay } from '@/components/common/error-display';

type HealthFilter = 'all' | 'green' | 'yellow' | 'red' | 'unknown';
type StatusFilter = 'all' | 'open' | 'close' | 'closed' | 'unknown';
type SortField = 'index' | 'docs_count' | 'store_size' | 'health' | 'status';
type SortDirection = 'asc' | 'desc';

function normalizeStatus(status?: string) {
  if (!status) return 'unknown';
  if (status === 'close') return 'closed';
  return status;
}

function parseNumberLike(value?: string | null) {
  if (!value || value === 'null') return 0;
  const normalized = value.replace(/,/g, '').trim();
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseByteSize(size?: string | null) {
  if (!size || size === 'null') return 0;

  const normalized = size.trim().toLowerCase();
  const match = normalized.match(/^([\d.]+)\s*(b|kb|mb|gb|tb|pb)?$/);

  if (!match) return 0;

  const value = Number(match[1]);
  const unit = match[2] ?? 'b';

  if (Number.isNaN(value)) return 0;

  const unitMap: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
    pb: 1024 ** 5,
  };

  return value * (unitMap[unit] ?? 1);
}

function formatDocsCount(value?: string | null) {
  if (!value || value === 'null') return '-';
  const parsed = parseNumberLike(value);
  return parsed.toLocaleString();
}

function formatStorageSize(value?: string | null) {
  if (!value || value === 'null' || value.trim() === '') return '-';
  return value;
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
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case 'open':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'closed':
      return 'border-slate-200 bg-slate-100 text-slate-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

function SummaryCard({ title, value, description, icon: Icon }: SummaryCardProps) {
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

export function IndicesManagementList() {
  const [indices, setIndices] = useState<IndexListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [includeHiddenIndex, setIncludeHiddenIndex] = useState(false);
  const [includeClosedIndex, setIncludeClosedIndex] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [sortField, setSortField] = useState<SortField>('index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const result = await fetchIndicesList(includeHiddenIndex, includeClosedIndex);
      setIndices(result.data.indices ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch indices list');
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [includeHiddenIndex, includeClosedIndex]);

  const filteredAndSortedIndices = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    const filtered = indices.filter((item) => {
      const matchesKeyword =
        keyword.length === 0 ||
        item.index.toLowerCase().includes(keyword) ||
        item.uuid.toLowerCase().includes(keyword);

      const itemHealth = item.health ?? 'unknown';
      const itemStatus = normalizeStatus(item.status);

      const matchesHealth = healthFilter === 'all' ? true : itemHealth === healthFilter;
      const matchesStatus = statusFilter === 'all' ? true : itemStatus === statusFilter;

      return matchesKeyword && matchesHealth && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'index':
          compareValue = a.index.localeCompare(b.index);
          break;
        case 'docs_count':
          compareValue = parseNumberLike(a.docs_count) - parseNumberLike(b.docs_count);
          break;
        case 'store_size':
          compareValue = parseByteSize(a.store_size) - parseByteSize(b.store_size);
          break;
        case 'health':
          compareValue = (a.health ?? '').localeCompare(b.health ?? '');
          break;
        case 'status':
          compareValue = normalizeStatus(a.status).localeCompare(normalizeStatus(b.status));
          break;
        default:
          compareValue = 0;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [indices, searchKeyword, healthFilter, statusFilter, sortField, sortDirection]);

  const summary = useMemo(() => {
    const totalDocs = filteredAndSortedIndices.reduce(
      (sum, item) => sum + parseNumberLike(item.docs_count),
      0
    );

    const totalStorageBytes = filteredAndSortedIndices.reduce(
      (sum, item) => sum + parseByteSize(item.store_size),
      0
    );

    const openCount = filteredAndSortedIndices.filter(
      (item) => normalizeStatus(item.status) === 'open'
    ).length;

    return {
      totalIndices: filteredAndSortedIndices.length,
      totalDocs,
      totalStorageBytes,
      openCount,
    };
  }, [filteredAndSortedIndices]);

  const totalStorageLabel = useMemo(() => {
    const bytes = summary.totalStorageBytes;

    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
  }, [summary.totalStorageBytes]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortDirection(field === 'index' ? 'asc' : 'desc');
  };

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => fetchData(true)}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-8 w-28" />
                <Skeleton className="mt-2 h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full" />
              ))}
            </div>
            <Skeleton className="mt-6 h-[420px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Visible Indices"
          value={summary.totalIndices.toLocaleString()}
          description="현재 필터 기준으로 보이는 인덱스 수"
          icon={Database}
        />
        <SummaryCard
          title="Open Indices"
          value={summary.openCount.toLocaleString()}
          description="상태가 open 인 인덱스 수"
          icon={RefreshCw}
        />
        <SummaryCard
          title="Documents"
          value={summary.totalDocs.toLocaleString()}
          description="현재 필터 기준 전체 문서 수"
          icon={FileText}
        />
        <SummaryCard
          title="Storage"
          value={totalStorageLabel}
          description="현재 필터 기준 전체 스토리지"
          icon={HardDrive}
        />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <CardTitle>Indices List</CardTitle>
              <CardDescription>
                Kibana 스타일의 인덱스 탐색 화면입니다. 인덱스를 클릭하면 상세 화면으로 이동합니다.
              </CardDescription>
            </div>

            <Button
              variant="outline"
              className="gap-2 self-start"
              onClick={() => fetchData(false)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <Label htmlFor="indices-search" className="mb-2 block text-sm text-slate-600">
                Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="indices-search"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="index name 또는 uuid 검색"
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="health-filter" className="mb-2 block text-sm text-slate-600">
                Health
              </Label>
              <select
                id="health-filter"
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value as HealthFilter)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">All health</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="red">Red</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status-filter" className="mb-2 block text-sm text-slate-600">
                Status
              </Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">All status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  id="include-hidden-index"
                  checked={includeHiddenIndex}
                  onCheckedChange={setIncludeHiddenIndex}
                />
                <Label htmlFor="include-hidden-index">Include hidden</Label>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="include-closed-index"
                  checked={includeClosedIndex}
                  onCheckedChange={setIncludeClosedIndex}
                />
                <Label htmlFor="include-closed-index">Include closed</Label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={sortField === 'index' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => handleSortChange('index')}
              >
                <ArrowUpDown className="h-4 w-4" />
                Name
              </Button>
              <Button
                variant={sortField === 'docs_count' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => handleSortChange('docs_count')}
              >
                <ArrowUpDown className="h-4 w-4" />
                Docs
              </Button>
              <Button
                variant={sortField === 'store_size' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => handleSortChange('store_size')}
              >
                <ArrowUpDown className="h-4 w-4" />
                Storage
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Index</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Health</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Primaries</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Replicas</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Documents</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Storage</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">UUID</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredAndSortedIndices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                        조건에 맞는 인덱스가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedIndices.map((item) => (
                      <tr
                        key={`${item.index}-${item.uuid}`}
                        className="border-b border-slate-100 transition hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3 align-middle">
                          <Link
                            href={`/indices/${encodeURIComponent(item.index)}`}
                            className="inline-flex items-center gap-2 font-medium text-slate-900 transition hover:text-sky-700"
                          >
                            <span>{item.index}</span>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </td>

                        <td className="px-4 py-3 align-middle">
                          <Badge variant="outline" className={getHealthBadgeClass(item.health)}>
                            {item.health ?? 'unknown'}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 align-middle">
                          <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                            {normalizeStatus(item.status)}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-right align-middle text-slate-700">
                          {item.pri || '-'}
                        </td>

                        <td className="px-4 py-3 text-right align-middle text-slate-700">
                          {item.rep || '-'}
                        </td>

                        <td className="px-4 py-3 text-right align-middle text-slate-700">
                          {formatDocsCount(item.docs_count)}
                        </td>

                        <td className="px-4 py-3 text-right align-middle text-slate-700">
                          {formatStorageSize(item.store_size)}
                        </td>

                        <td className="px-4 py-3 align-middle text-xs text-slate-500">
                          <span className="line-clamp-1 break-all">{item.uuid}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              {filteredAndSortedIndices.length.toLocaleString()} / {indices.length.toLocaleString()} indices
            </p>
            <p>
              sort: {sortField} ({sortDirection})
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}