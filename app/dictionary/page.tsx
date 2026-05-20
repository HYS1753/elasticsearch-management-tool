'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DictionaryTable } from '@/components/dictionary/dictionary-table';
import { DictionaryType } from '@/types/dictionary';
import { getUserInfoFromCookie } from '@/lib/client-api/auth';
import {
  Book, GitBranch, Link as LinkIcon, SpellCheck, Ban, Shield, ArrowRight,
  CloudLightning, CheckCircle2, Loader2, XCircle, AlertCircle, Terminal,
  ChevronUp, ChevronDown, Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const DICTIONARY_INFO = {
  user: {
    title: 'User Dictionary',
    description: '사용자 정의 사전을 관리합니다. 형태소 분석 시 최우선으로 적용될 단어들을 정의합니다.',
    icon: Book,
  },
  decompound: {
    title: 'Decompound Dictionary',
    description: '복합명사 사전을 관리합니다. 복합어를 여러 개의 단일어로 분리하는 규칙을 정의합니다.',
    icon: GitBranch,
  },
  synonym: {
    title: 'Synonym Dictionary',
    description: '동의어 사전을 관리합니다. 검색어 확장 및 유의어 처리를 위한 단어 그룹을 정의합니다.',
    icon: LinkIcon,
  },
  correction: {
    title: 'Correction Dictionary',
    description: '오타 교정 사전을 관리합니다. 자주 틀리는 검색어를 올바른 단어로 교정하는 규칙을 정의합니다.',
    icon: SpellCheck,
  },
  stopword: {
    title: 'Stopword Dictionary',
    description: '불용어 사전을 관리합니다. 검색 결과에 영향을 주지 않는 무의미한 단어들을 필터링합니다.',
    icon: Ban,
  }
};

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
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
      </div>
      <p className="mt-1 ml-7 text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

interface LogStep {
  step: string;
  message: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  details?: any;
}

function LogItem({ log, idx }: { log: LogStep; idx: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const isRunningStep = log.status === 'RUNNING';
  const isSuccessStep = log.status === 'SUCCESS';
  const isFailedStep = log.status === 'FAILED';

  return (
    <div
      className="flex flex-col gap-2 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all duration-300 animate-in fade-in slide-in-from-top-3 duration-500 ease-out"
      style={{ animationDelay: `${Math.min(idx * 40, 200)}ms` }}
    >
      <div
        className={`flex items-center gap-3 cursor-pointer group rounded-lg p-2 -m-2 transition-colors duration-200 ${log.details ? 'hover:bg-slate-50/80 dark:bg-slate-900/80' : 'cursor-default'
          }`}
        onClick={() => log.details && setIsOpen(!isOpen)}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full shrink-0">
          {isRunningStep && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
          {isSuccessStep && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
              <Check className="h-3 w-3 text-emerald-600 font-bold" />
            </div>
          )}
          {isFailedStep && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 border border-rose-200">
              <XCircle className="h-3 w-3 text-rose-600" />
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <p className={`text-sm font-semibold ${isRunningStep ? 'text-indigo-600 animate-pulse' : isSuccessStep ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-rose-600'
              }`}>
              {log.message}
            </p>
            {isSuccessStep && (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100/60 shadow-sm/subtle">성공</span>
            )}
            {isRunningStep && (
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100/60 animate-pulse">진행중</span>
            )}
          </div>

          {log.details && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-indigo-600 transition-colors font-medium">
              <span>{isOpen ? '상세 접기' : '상세 보기'}</span>
              <span className="transition-transform duration-200 transform">
                {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Accordion detail view */}
      {log.details && isOpen && (
        <div className="pl-8 mt-1.5 animate-in fade-in slide-in-from-top-1.5 duration-200">
          <pre className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/50 p-3.5 rounded-lg max-w-full overflow-x-auto font-mono shadow-inner leading-relaxed">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function DictionaryPage() {
  const [activeTab, setActiveTab] = useState<DictionaryType>('user');
  const [user, setUser] = useState<{ user_id: string; name: string; role: string } | null>(null);

  const tabKeys: DictionaryType[] = ['user', 'decompound', 'synonym', 'correction', 'stopword'];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    width: number;
    left: number;
    opacity: number;
  }>({ width: 0, left: 0, opacity: 0 });

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = tabKeys.indexOf(activeTab);
      if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
        const activeElement = tabRefs.current[activeIndex];
        if (activeElement) {
          setIndicatorStyle({
            width: activeElement.offsetWidth,
            left: activeElement.offsetLeft,
            opacity: 1,
          });
        }
      }
    };
    updateIndicator();
    const timer = setTimeout(updateIndicator, 100);

    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(timer);
    };
  }, [activeTab]);

  // Streaming State
  const [logs, setLogs] = useState<LogStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAction, setCurrentAction] = useState<'validate' | 'publish' | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      setRefreshKey(prev => prev + 1);
    }
    setIsDeployDialogOpen(open);
  };

  useEffect(() => {
    setUser(getUserInfoFromCookie());
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  const startStream = (action: 'validate' | 'publish') => {
    setIsRunning(true);
    setCurrentAction(action);
    setLogs([]);
    setProgress(0);
    setErrorMsg(null);
    setIsPanelExpanded(true);

    const eventSource = new EventSource(`/api/dictionary-action/${action}/stream`);

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        setIsRunning(false);
        eventSource.close();
        return;
      }
      try {
        const data = JSON.parse(event.data);

        setLogs((prev) => {
          const existingIdx = prev.findIndex(item => item.step === data.step);
          let nextLogs = [...prev];
          if (existingIdx > -1) {
            nextLogs[existingIdx] = data;
          } else {
            nextLogs.push(data);
          }

          const totalSteps = action === 'validate' ? 8 : 13;
          const successCount = nextLogs.filter(item => item.status === 'SUCCESS').length;
          const calculatedProgress = Math.min(Math.round((successCount / totalSteps) * 100), 100);
          setProgress(calculatedProgress);

          return nextLogs;
        });

        if (data.status === 'FAILED') {
          setErrorMsg(data.message);
          setIsRunning(false);
          eventSource.close();
        }

        if (data.step === 'COMPLETE' && data.status === 'SUCCESS') {
          setIsRunning(false);
          eventSource.close();
        }
      } catch (e: any) {
        console.error("Failed to parse event", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed", err);
      setErrorMsg("SSE 스트림 연결에 실패했거나 세션 인증이 만료되었습니다.");
      setIsRunning(false);
      eventSource.close();
    };
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Dictionary Management"
          description="Manage analyzers, stopwords, synonyms, and custom dictionary entries"
          actions={
            isAdmin && (
              <Button
                onClick={() => setIsDeployDialogOpen(true)}
                variant="outline"
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-700 h-11 px-5 rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
              >
                <CloudLightning className="h-4 w-4 mr-2 text-indigo-500 animate-pulse" />
                Sync & Deploy (배포 및 검증)
              </Button>
            )
          }
        />

        {/* Dictionary Workflow Description */}
        <Card className="border-blue-100 bg-blue-50/30 dark:border-blue-500/20 dark:bg-blue-500/10 shadow-none">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Dictionary Approval Workflow</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Viewer:</span> View only |
                    <span className="font-medium text-slate-700 dark:text-slate-300 ml-2">Writer:</span> Add & Edit entries |
                    <span className="font-medium text-slate-700 dark:text-slate-300 ml-2">Admin:</span> Approve/Reject & Apply
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[10px] font-bold">DRAFT</div>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 border border-green-200 text-[10px] font-bold">APPROVED / REJECTED</div>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 text-[10px] font-bold">APPLIED</div>
                <div className="ml-2 text-[10px] text-slate-400 italic">* Only Admin can process stages beyond DRAFT</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as DictionaryType)}
          className="w-full space-y-8"
        >
          <TabsList className="relative bg-slate-50/60 dark:bg-slate-900/40 backdrop-blur-md p-2 flex-wrap h-auto w-full justify-start gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm/subtle">
            {/* Sliding liquid crystal indicator */}
            <div
              className="absolute pointer-events-none rounded-xl transition-all duration-500 ease-out h-[40px] bg-gradient-to-br from-white/90 to-slate-50/95 dark:from-slate-800/80 dark:to-slate-900/90 shadow-[0_3px_12px_rgba(148,163,184,0.15),0_1px_3px_rgba(148,163,184,0.18),inset_0_1px_2px_rgba(255,255,255,0.95)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-md border border-slate-400/30 dark:border-slate-700"
              style={{
                width: indicatorStyle.width,
                left: indicatorStyle.left,
                opacity: indicatorStyle.opacity,
                top: '8px',
              }}
            >
              {/* Liquid droplet inner glow */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.35)_40%,transparent_70%)] dark:bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.15)_0%,transparent_70%)]"
              />
              <div
                className="absolute inset-0 rounded-xl pointer-events-none bg-[radial-gradient(ellipse_at_70%_80%,rgba(148,163,184,0.08)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_70%_80%,rgba(255,255,255,0.04)_0%,transparent_50%)]"
              />
            </div>

            {Object.entries(DICTIONARY_INFO).map(([key, info], index) => {
              const Icon = info.icon;
              const active = activeTab === key;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  className={`
                    group relative z-10 px-5 py-2.5 flex items-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 border-0 bg-transparent shadow-none!
                    data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:!border-transparent
                    ${active
                      ? 'text-slate-900 dark:text-slate-50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200'
                    }
                  `}
                >
                  {/* Hover effect for non-active items */}
                  {!active && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-slate-400/[0.04] to-slate-400/[0.08] dark:from-white/[0.03] dark:to-white/[0.05] transition-opacity duration-300 pointer-events-none"
                    />
                  )}
                  <Icon className={`h-4 w-4 relative z-10 transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="relative z-10 transition-all duration-300">
                    {info.title}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="space-y-4">
            <SectionHeading
              icon={DICTIONARY_INFO[activeTab].icon}
              title={DICTIONARY_INFO[activeTab].title}
              description={DICTIONARY_INFO[activeTab].description}
            />

            <TabsContent value="user" className="m-0 border-none p-0 outline-none">
              <DictionaryTable
                key={`user_${refreshKey}`}
                type="user"
                isAdmin={isAdmin}
              />
            </TabsContent>
            <TabsContent value="decompound" className="m-0 border-none p-0 outline-none">
              <DictionaryTable
                key={`decompound_${refreshKey}`}
                type="decompound"
                isAdmin={isAdmin}
              />
            </TabsContent>
            <TabsContent value="synonym" className="m-0 border-none p-0 outline-none">
              <DictionaryTable
                key={`synonym_${refreshKey}`}
                type="synonym"
                isAdmin={isAdmin}
              />
            </TabsContent>
            <TabsContent value="correction" className="m-0 border-none p-0 outline-none">
              <DictionaryTable
                key={`correction_${refreshKey}`}
                type="correction"
                isAdmin={isAdmin}
              />
            </TabsContent>
            <TabsContent value="stopword" className="m-0 border-none p-0 outline-none">
              <DictionaryTable
                key={`stopword_${refreshKey}`}
                type="stopword"
                isAdmin={isAdmin}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Sync & Deploy Center Popup Layer Dialog */}
        <Dialog open={isDeployDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[950px] sm:min-w-[950px] sm:h-[680px] sm:min-h-[680px] overflow-hidden bg-white dark:bg-slate-950 border border-slate-200/80 rounded-2xl shadow-2xl p-7 flex flex-col justify-between">
            <DialogHeader className="space-y-2 shrink-0 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner shrink-0 animate-in spin-in-12 duration-500">
                  <CloudLightning className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    사전 동기화 및 원격 검증 프로세스
                    <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100/50 px-1.5 py-0 rounded-sm uppercase tracking-wide inline-flex items-center justify-center h-4.5 shrink-0 ml-2">ADMIN ONLY</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400 font-semibold mt-0.5">
                    원격 Elasticsearch 클러스터 노드군을 대상으로 실시간 배포 및 분석 타당성을 모니터링합니다.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 flex flex-col justify-between gap-5 mt-5 overflow-hidden">
              {/* Top Action Control Box */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/50 rounded-xl flex items-center justify-between gap-6 shrink-0 shadow-sm/subtle">
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed flex-1">
                  승인(APPROVED)된 사전 항목들을 Elasticsearch 원격 서버 노드들에 동기화하거나
                  <br />
                  원본 훼손 없이 형태소 분석기를 가상 시뮬레이션하여 실시간 검증합니다.
                </p>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => startStream('validate')}
                    disabled={isRunning}
                    className="h-[72px] w-[140px] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 disabled:opacity-50 text-sm font-semibold transition-all duration-150 shadow-sm flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 leading-none">
                      {isRunning && currentAction === 'validate' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                      )}
                      검증하기
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium leading-none mt-1">
                      (Validate)
                    </span>
                  </button>

                  <button
                    onClick={() => setShowPublishConfirm(true)}
                    disabled={isRunning}
                    className="h-[72px] w-[170px] rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-sm font-semibold transition-all duration-150 shadow-md shadow-indigo-600/10 active:scale-[0.98] flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 leading-none">
                      {isRunning && currentAction === 'publish' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      ) : (
                        <CloudLightning className="h-3.5 w-3.5 text-white" />
                      )}
                      반영하기
                    </span>
                    <span className="text-[11px] text-indigo-200 font-medium leading-none mt-1">
                      (Publish & Apply)
                    </span>
                  </button>
                </div>
              </div>

              {/* Progress & Live Log Panel inside modal */}
              <div className="border border-slate-200/50 rounded-xl bg-slate-50/40 dark:bg-slate-900/40 p-5 flex flex-col flex-1 h-[370px] min-h-[370px] max-h-[370px] overflow-hidden justify-between space-y-4 shadow-sm/subtle">
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Terminal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span>실시간 동기화 상태:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${errorMsg
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : logs.some(l => l.step === 'COMPLETE')
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : logs.length > 0
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}>
                      {errorMsg
                        ? '실패 (Failed)'
                        : logs.some(l => l.step === 'COMPLETE')
                          ? '완료 (Complete)'
                          : logs.length > 0
                            ? currentAction === 'validate' ? '검증 중...' : '배포 중...'
                            : '대기 중 (Standby)'}
                    </span>
                  </div>
                  {logs.length > 0 && (
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      진행 상황: <span className="font-bold text-indigo-600">{progress}%</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/20 dark:border-slate-800/40 rounded-full overflow-hidden shrink-0">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${errorMsg ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                      }`}
                    style={{ width: `${logs.length > 0 ? progress : 0}%` }}
                  />
                </div>

                {/* Log View Box */}
                <div className="flex-1 min-h-[220px] h-[220px] max-h-[220px] overflow-hidden flex flex-col justify-between">
                  {logs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 p-6 text-slate-400 text-center gap-2">
                      <Terminal className="h-8 w-8 text-slate-300 animate-pulse" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">실시간 로그 모니터링 콘솔 대기 중</p>
                      <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
                        상단의 검증 또는 반영하기 버튼을 누르면 동기화 프로세스 및 분석 결과가 여기에 실시간 출력됩니다.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200/50 rounded-xl p-4.5 space-y-3.5 max-h-[220px] overflow-y-auto shadow-inner/sm">
                      {logs.slice().reverse().map((log, idx) => (
                        <LogItem key={log.step || idx} log={log} idx={idx} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Failure Alert Box */}
                {errorMsg && (
                  <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg flex items-center gap-2.5 text-rose-900 shrink-0 shadow-sm/subtle">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                    <p className="text-xs font-mono text-rose-700 truncate flex-1 leading-none">
                      <strong>에러 발생:</strong> {errorMsg}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Publish Confirmation Dialog */}
        <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
          <AlertDialogContent className="max-w-md bg-white dark:bg-slate-950 border border-slate-200/80 rounded-xl shadow-xl p-6">
            <AlertDialogHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600 shadow-inner shrink-0 mb-1">
                <CloudLightning className="h-6 w-6 animate-pulse" />
              </div>
              <AlertDialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
                운영 서버 사전 반영 확인
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  승인된 사전을 원격 Elasticsearch 클러스터 노드들에 영구 배포 및 반영하시겠습니까?
                </p>
                <p>
                  이 작업은 실제 운영 환경에 실시간으로 즉시 동적 적용됩니다. 배포 시작 직전 기존 사전 파일들은 시분초 단위 타임스탬프(`backup/*_YYYYMMDD_HHMMSS.txt`)를 붙여 안전하게 백업 폴더로 저장됩니다.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 flex items-center gap-3">
              <AlertDialogCancel className="w-full sm:w-auto px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                취소하기
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowPublishConfirm(false);
                  startStream('publish');
                }}
                className="w-full sm:w-auto px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-semibold cursor-pointer shadow-md transition-all duration-200 hover:shadow-lg"
              >
                진행 및 반영하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
