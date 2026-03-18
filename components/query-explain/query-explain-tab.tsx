'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import type {
  QueryExplainDetailRequest,
  QueryExplainSummaryHit,
  QueryExplainSummaryRequest,
  QueryExplainDetailResponse,
  QueryExplainSummaryResponse,
} from '@/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { QueryExplainSummaryList } from '@/components/query-explain/query-explain-summary-list';
import { QueryExplainDetailDialog } from '@/components/query-explain/query-explain-detail-dialog';

export function QueryExplainTab() {
  const [indexName, setIndexName] = useState('');
  const [queryText, setQueryText] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);

  const [includeSourceFields, setIncludeSourceFields] = useState(false);
  const [docTitleFieldsText, setDocTitleFieldsText] = useState('');

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<QueryExplainSummaryResponse | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<QueryExplainDetailResponse | null>(null);
  const [selectedHit, setSelectedHit] = useState<QueryExplainSummaryHit | null>(null);

  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const [leftPanelHeight, setLeftPanelHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!leftPanelRef.current) return;

    const updateHeight = () => {
        if (leftPanelRef.current) {
        setLeftPanelHeight(leftPanelRef.current.offsetHeight);
        }
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
        updateHeight();
    });

    observer.observe(leftPanelRef.current);

    window.addEventListener('resize', updateHeight);

    return () => {
        observer.disconnect();
        window.removeEventListener('resize', updateHeight);
    };
  }, []);

  const docTitleFields = useMemo(
    () =>
      docTitleFieldsText
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    [docTitleFieldsText]
  );

  const validateQueryJson = (value: string): { valid: boolean; parsed?: Record<string, unknown>; error?: string } => {
    const trimmed = value.trim();

    if (!trimmed) {
      return {
        valid: false,
        error: 'Search Body JSON을 입력해 주세요.',
      };
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
        return {
          valid: false,
          error: 'Search Body JSON은 object 형태여야 합니다. 예: {}',
        };
      }

      return {
        valid: true,
        parsed,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: `JSON 형식이 올바르지 않습니다. ${error.message}`,
      };
    }
  };

  const buildSummaryRequest = (): QueryExplainSummaryRequest | null => {
    const validation = validateQueryJson(queryText);

    if (!validation.valid) {
      setQueryError(validation.error || 'JSON 형식이 올바르지 않습니다.');
      return null;
    }

    setQueryError(null);

    return {
      index: indexName.trim(),
      body: validation.parsed!,
      include_source_fields: includeSourceFields,
      doc_title_fields: docTitleFields,
    };
  };

  const handleQueryChange = (value: string) => {
    setQueryText(value);

    if (!value.trim()) {
      setQueryError(null);
      return;
    }

    const validation = validateQueryJson(value);
    setQueryError(validation.valid ? null : validation.error || 'JSON 형식이 올바르지 않습니다.');
  };

  const handleSearch = async () => {
    try {
      const payload = buildSummaryRequest();
      if (!payload) {
        return;
      }

      if (!payload.index) {
        toast.error('Index Name을 입력해 주세요.');
        return;
      }

      setLoading(true);

      const response = await fetch('/api/query-explain/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch explain summary');
      }

      setSummary(data.data);
    } catch (error: any) {
      toast.error(error.message || 'Query Explain summary 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleClickHit = async (hit: QueryExplainSummaryHit) => {
    try {
      const validation = validateQueryJson(queryText);
      if (!validation.valid) {
        setQueryError(validation.error || 'JSON 형식이 올바르지 않습니다.');
        toast.error('Search Body JSON 형식을 확인해 주세요.');
        return;
      }

      setSelectedHit(hit);
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailData(null);

      const payload: QueryExplainDetailRequest = {
        index: indexName.trim(),
        body: validation.parsed!,
        doc_id: hit.id,
        include_raw_explain: false,
        include_source_fields: includeSourceFields,
        doc_title_fields: docTitleFields,
      };

      const response = await fetch('/api/query-explain/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch explain detail');
      }

      setDetailData(data.data);
    } catch (error: any) {
      toast.error(error.message || 'Explain detail 조회 실패');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <div ref={leftPanelRef}>
            <Card className="border-slate-200/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Query Explain Input
                </CardTitle>
                <CardDescription>
                Summary API 요청값을 입력합니다.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="space-y-2">
                <Label htmlFor="indexName">Index Name</Label>
                <Input
                    id="indexName"
                    value={indexName}
                    onChange={(e) => setIndexName(e.target.value)}
                    placeholder="index name"
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="docTitleFields">Doc Title Fields</Label>
                <Input
                    id="docTitleFields"
                    value={docTitleFieldsText}
                    onChange={(e) => setDocTitleFieldsText(e.target.value)}
                    placeholder="field1, field2"
                />
                <p className="text-xs text-slate-500">
                    쉼표로 구분하세요. 비어 있으면 doc_id가 제목으로 내려옵니다.
                </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                    <Label htmlFor="includeSourceFields">Include Source</Label>
                    <p className="mt-1 text-xs text-slate-500">
                    summary/detail 응답에 source 포함
                    </p>
                </div>
                <Switch
                    id="includeSourceFields"
                    checked={includeSourceFields}
                    onCheckedChange={setIncludeSourceFields}
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="queryText">Search Body JSON</Label>
                <Textarea
                    id="queryText"
                    value={queryText}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="{}"
                    className="min-h-[420px] font-mono text-sm"
                />

                {queryError && (
                    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{queryError}</span>
                    </div>
                )}
                </div>

                <Button onClick={handleSearch} className="w-full gap-2" disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Run Explain Summary
                </Button>
            </CardContent>
            </Card>
        </div>

        <QueryExplainSummaryList
            loading={loading}
            summary={summary}
            onSelectHit={handleClickHit}
            height={leftPanelHeight}
        />
      </div>

      <QueryExplainDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        loading={detailLoading}
        data={detailData}
        selectedHit={selectedHit}
      />
    </>
  );
}