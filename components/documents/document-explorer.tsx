'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Database,
  FileJson,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  PanelRightOpen,
  Rows3,
  Table2,
} from 'lucide-react';

import {
  fetchDocumentIndices,
  searchDocuments,
} from '@/lib/client-api/documents';
import type {
  DocumentHitItem,
  DocumentSearchRequest,
  DocumentExplorerIndexItem,
} from '@/types/document-explorer';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ErrorDisplay } from '@/components/common/error-display';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DEFAULT_QUERY_TEXT = `{
  "match_all": {}
}`;

type ResultsViewMode = 'list' | 'table';

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString();
}

function formatPreviewValue(value: unknown) {
  if (value === null || value === undefined) return '-';

  if (typeof value === 'string') {
    return value.length > 160 ? `${value.slice(0, 160)}...` : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function getPreviewEntries(source: Record<string, unknown>, limit: number = 8) {
  return Object.entries(source).slice(0, limit);
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

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      <p className="mt-1 ml-7 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function IndexListPanel({
  indices,
  selectedIndex,
  onSelect,
}: {
  indices: DocumentExplorerIndexItem[];
  selectedIndex: string;
  onSelect: (indexName: string) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Indices</CardTitle>
        <CardDescription>탐색할 인덱스를 선택합니다.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[720px] overflow-auto">
          {indices.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              탐색 가능한 인덱스가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {indices.map((item) => {
                const active = selectedIndex === item.index;

                return (
                  <button
                    key={item.index}
                    type="button"
                    onClick={() => onSelect(item.index)}
                    className={`flex w-full flex-col gap-2 px-5 py-4 text-left transition ${
                      active ? 'bg-sky-50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {item.index}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getHealthBadgeClass(item.health)}>
                          {item.health ?? 'unknown'}
                        </Badge>
                        <Badge variant="outline" className={getStatusBadgeClass(item.status)}>
                          {item.status === 'close' ? 'closed' : item.status ?? 'unknown'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>docs: {item.docs_count ?? '-'}</span>
                      <span>store: {item.store_size ?? '-'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ResultSummaryCards({
  total,
  took,
  page,
  totalPages,
}: {
  total: number;
  took: number;
  page: number;
  totalPages: number;
}) {
  return (
    <div className="grid min-w-[280px] grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</div>
        <div className="mt-1 text-base font-semibold text-slate-900">{formatNumber(total)}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Took</div>
        <div className="mt-1 text-base font-semibold text-slate-900">{formatNumber(took)} ms</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Page</div>
        <div className="mt-1 text-base font-semibold text-slate-900">{page}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Pages</div>
        <div className="mt-1 text-base font-semibold text-slate-900">{totalPages}</div>
      </div>
    </div>
  );
}

function DocumentListItem({
  doc,
  onView,
}: {
  doc: DocumentHitItem;
  onView: (doc: DocumentHitItem) => void;
}) {
  const previewEntries = getPreviewEntries(doc._source, 8);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Document
          </div>

          <div className="break-all text-base font-semibold text-slate-900">{doc._id}</div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-lg">
              _score: {doc._score ?? '-'}
            </Badge>
            <Badge variant="outline" className="rounded-lg">
              {doc._index}
            </Badge>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl"
          onClick={() => onView(doc)}
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {previewEntries.map(([key, value]) => (
            <div
              key={key}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
            >
              <div className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
                {key}
              </div>
              <div className="mt-1 break-all text-sm leading-6 text-slate-800">
                {formatPreviewValue(value)}
              </div>
            </div>
          ))}
        </div> */}

        <div className="rounded-xl border border-slate-200 bg-slate-50">
          <div className="border-b border-slate-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Raw JSON Preview
          </div>
          <div className="max-h-[260px] overflow-auto p-3">
            <pre className="whitespace-pre-wrap break-all text-xs leading-6 text-slate-800">
              {JSON.stringify(doc._source, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTableColumns(documents: DocumentHitItem[], limit: number = 8) {
  const keys = new Set<string>();

  documents.forEach((doc) => {
    Object.keys(doc._source ?? {}).forEach((key) => {
      if (keys.size < limit) {
        keys.add(key);
      }
    });
  });

  return Array.from(keys);
}

function DocumentTableView({
  documents,
  onView,
}: {
  documents: DocumentHitItem[];
  onView: (doc: DocumentHitItem) => void;
}) {
  const columns = useMemo(() => getTableColumns(documents, 8), [documents]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="max-h-[calc(94vh-240px)] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left font-medium text-slate-600">_id</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">_score</th>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left font-medium text-slate-600">
                  {column}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {documents.map((doc) => (
              <tr
                key={`${doc._index}-${doc._id}`}
                className="border-b border-slate-100 align-top transition hover:bg-slate-50"
              >
                <td className="max-w-[320px] px-4 py-3 font-medium text-slate-900">
                  <div className="break-all">{doc._id}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{doc._score ?? '-'}</td>

                {columns.map((column) => (
                  <td key={column} className="max-w-[240px] px-4 py-3 text-slate-700">
                    <div className="line-clamp-3 break-all">{formatPreviewValue(doc._source?.[column])}</div>
                  </td>
                ))}

                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl"
                    onClick={() => onView(doc)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocumentExplorer() {
  const [indices, setIndices] = useState<DocumentExplorerIndexItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [queryText, setQueryText] = useState(DEFAULT_QUERY_TEXT);
  const [size, setSize] = useState(20);
  const [page, setPage] = useState(1);

  const [documents, setDocuments] = useState<DocumentHitItem[]>([]);
  const [total, setTotal] = useState(0);
  const [took, setTook] = useState(0);

  const [loadingIndices, setLoadingIndices] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDocument, setSelectedDocument] = useState<DocumentHitItem | null>(null);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);

  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultsViewMode, setResultsViewMode] = useState<ResultsViewMode>('list');

  const totalPages = useMemo(() => {
    if (size <= 0) return 1;
    return Math.max(1, Math.ceil(total / size));
  }, [total, size]);

  const loadIndices = async () => {
    setLoadingIndices(true);
    setError(null);

    try {
      const result = await fetchDocumentIndices();
      const items = result.data?.indices ?? [];
      setIndices(items);

      if (!selectedIndex && items.length > 0) {
        setSelectedIndex(items[0].index);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch document indices');
    } finally {
      setLoadingIndices(false);
    }
  };

  const loadDocuments = async (targetPage?: number, openResultsDialog: boolean = true) => {
    if (!selectedIndex) return;

    setLoadingDocuments(true);
    setError(null);

    try {
      const pageToLoad = targetPage ?? page;
      const from = (pageToLoad - 1) * size;

      let parsedQuery: Record<string, unknown> = { match_all: {} };

      if (queryText.trim()) {
        parsedQuery = JSON.parse(queryText);
      }

      const payload: DocumentSearchRequest = {
        index_name: selectedIndex,
        query: parsedQuery,
        from,
        size,
      };

      const result = await searchDocuments(payload);

      setDocuments(result.data?.hits ?? []);
      setTotal(result.data?.total ?? 0);
      setTook(result.data?.took ?? 0);
      setPage(pageToLoad);

      setHasSearched(true);
      if (openResultsDialog) {
        setIsResultsDialogOpen(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadIndices();
  }, []);

  useEffect(() => {
    if (!selectedIndex) return;
    setPage(1);
    loadDocuments(1, false);
  }, [selectedIndex]);

  const selectedIndexInfo = useMemo(
    () => indices.find((item) => item.index === selectedIndex),
    [indices, selectedIndex]
  );

  if (error && !loadingIndices && indices.length === 0) {
    return <ErrorDisplay error={error} onRetry={loadIndices} />;
  }

  return (
    <>
      <div className="space-y-8">
        <section className="space-y-4">
          <SectionHeading
            icon={Database}
            title="Documents Explorer"
            description="MongoDB Compass처럼 인덱스를 선택하고 문서를 탐색합니다."
          />

          <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div>
              {loadingIndices ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-20 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <IndexListPanel
                  indices={indices}
                  selectedIndex={selectedIndex}
                  onSelect={setSelectedIndex}
                />
              )}
            </div>

            <div className="min-w-0">
              <Card>
                <CardHeader className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Query Workspace</CardTitle>
                      <CardDescription>
                        선택한 인덱스에 대해 JSON DSL 쿼리를 실행합니다.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => loadDocuments(page, true)}
                        disabled={loadingDocuments || !selectedIndex}
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingDocuments ? 'animate-spin' : ''}`} />
                        Run Query
                      </Button>

                      <Button
                        variant="outline"
                        className="gap-2"
                        disabled={!hasSearched}
                        onClick={() => setIsResultsDialogOpen(true)}
                      >
                        <PanelRightOpen className="h-4 w-4" />
                        View Results
                      </Button>
                    </div>
                  </div>

                  {selectedIndexInfo && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={getHealthBadgeClass(selectedIndexInfo.health)}>
                        {selectedIndexInfo.health ?? 'unknown'}
                      </Badge>
                      <Badge variant="outline" className={getStatusBadgeClass(selectedIndexInfo.status)}>
                        {selectedIndexInfo.status === 'close'
                          ? 'closed'
                          : selectedIndexInfo.status ?? 'unknown'}
                      </Badge>
                      <span className="text-sm text-slate-600">
                        index: <span className="font-medium text-slate-900">{selectedIndexInfo.index}</span>
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_160px]">
                    <div className="space-y-2">
                      <Label>Query DSL</Label>
                      <textarea
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        className="min-h-[640px] w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        spellCheck={false}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <select
                          value={size}
                          onChange={(e) => setSize(Number(e.target.value))}
                          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Result Summary
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          <div>
                            total: <span className="font-medium text-slate-900">{formatNumber(total)}</span>
                          </div>
                          <div>
                            took: <span className="font-medium text-slate-900">{formatNumber(took)} ms</span>
                          </div>
                          <div>
                            page: <span className="font-medium text-slate-900">{page}</span>
                          </div>
                          <div>
                            pages: <span className="font-medium text-slate-900">{totalPages}</span>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="!w-[96vw] !max-w-[1600px] h-[94vh] overflow-hidden p-0">
          <div className="flex h-full min-h-0 flex-col bg-white">
            <DialogHeader className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl font-semibold text-slate-900">
                    Documents
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-slate-600">
                    검색 결과 문서를 탐색하고 상세 원문을 확인합니다.
                  </DialogDescription>
                </div>

                <ResultSummaryCards
                  total={total}
                  took={took}
                  page={page}
                  totalPages={totalPages}
                />
              </div>
            </DialogHeader>

            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <div className="text-sm text-slate-600">
                page <span className="font-semibold text-slate-900">{page}</span> / {totalPages}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-2 inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <Button
                    type="button"
                    variant={resultsViewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2 rounded-lg"
                    onClick={() => setResultsViewMode('list')}
                  >
                    <Rows3 className="h-4 w-4" />
                    List
                  </Button>
                  <Button
                    type="button"
                    variant={resultsViewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2 rounded-lg"
                    onClick={() => setResultsViewMode('table')}
                  >
                    <Table2 className="h-4 w-4" />
                    Grid
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loadingDocuments}
                  onClick={() => loadDocuments(page - 1, true)}
                  className="gap-2 rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loadingDocuments}
                  onClick={() => loadDocuments(page + 1, true)}
                  className="gap-2 rounded-xl"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-6 py-5">
              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {loadingDocuments ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-[280px] w-full rounded-2xl" />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
                  <div>
                    <FileJson className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                    <div className="text-sm text-slate-600">조회된 문서가 없습니다.</div>
                  </div>
                </div>
              ) : resultsViewMode === 'list' ? (
                <div className="h-full overflow-auto pr-2">
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <DocumentListItem
                        key={`${doc._index}-${doc._id}`}
                        doc={doc}
                        onView={(targetDoc) => {
                          setSelectedDocument(targetDoc);
                          setIsDocumentDialogOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <DocumentTableView
                  documents={documents}
                  onView={(targetDoc) => {
                    setSelectedDocument(targetDoc);
                    setIsDocumentDialogOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Document Detail</DialogTitle>
            <DialogDescription>
              선택한 문서의 전체 JSON 원문입니다.
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="text-slate-500">Index</div>
                  <div className="mt-1 break-all font-medium text-slate-900">
                    {selectedDocument._index}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="text-slate-500">Document ID</div>
                  <div className="mt-1 break-all font-medium text-slate-900">
                    {selectedDocument._id}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="text-slate-500">Score</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {selectedDocument._score ?? '-'}
                  </div>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <pre className="whitespace-pre-wrap break-all text-sm leading-6 text-slate-800">
                  {JSON.stringify(selectedDocument._source, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}