'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
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
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      <p className="mt-1 ml-7 text-sm text-slate-600">{description}</p>
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
      className="flex flex-col gap-2 py-3 border-b border-slate-100 last:border-0 transition-all duration-300 animate-in fade-in slide-in-from-top-3 duration-500 ease-out"
      style={{ animationDelay: `${Math.min(idx * 40, 200)}ms` }}
    >
      <div 
        className={`flex items-start gap-3 cursor-pointer group rounded-lg p-1.5 -m-1.5 transition-colors duration-200 ${
          log.details ? 'hover:bg-slate-50/80' : 'cursor-default'
        }`}
        onClick={() => log.details && setIsOpen(!isOpen)}
      >
        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full shrink-0">
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
            <p className={`text-sm font-semibold ${
              isRunningStep ? 'text-indigo-600 animate-pulse' : isSuccessStep ? 'text-slate-800 font-medium' : 'text-rose-600'
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
          <pre className="text-[11px] text-slate-600 bg-slate-50/70 border border-slate-200/50 p-3.5 rounded-lg max-w-full overflow-x-auto font-mono shadow-inner leading-relaxed">
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

  // Streaming State
  const [logs, setLogs] = useState<LogStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAction, setCurrentAction] = useState<'validate' | 'publish' | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

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
          
          const totalSteps = action === 'validate' ? 8 : 6;
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <PageHeader
          title="Dictionary Management"
          description="Manage analyzers, stopwords, synonyms, and custom dictionary entries"
        />

        {/* Dictionary Workflow Description */}
        <Card className="border-blue-100 bg-blue-50/30 shadow-none">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Dictionary Approval Workflow</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <span className="font-medium text-slate-700">Viewer:</span> View only | 
                    <span className="font-medium text-slate-700 ml-2">Writer:</span> Add & Edit entries | 
                    <span className="font-medium text-slate-700 ml-2">Admin:</span> Approve/Reject & Apply
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold">DRAFT</div>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold">APPROVED / REJECTED</div>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold">APPLIED</div>
                <div className="ml-2 text-[10px] text-slate-400 italic">* Only Admin can process stages beyond DRAFT</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ADMIN Sync & Deploy Manager Bar */}
        {isAdmin && (
          <Card className="border-slate-200/80 bg-gradient-to-br from-slate-50/40 via-white to-slate-50/30 hover:border-slate-300/80 hover:shadow-md transition-all duration-300 relative overflow-hidden rounded-xl shadow-sm">
            {/* Decorative soft glow */}
            <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
            
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner">
                    <CloudLightning className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      사전 서버 동기화 및 검증 관리
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">ADMIN ONLY</span>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      승인(APPROVED)된 사전 항목들을 Elasticsearch 원격 서버 노드들에 동기화하고 형태소 분석 유효성을 원격 검증합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startStream('validate')}
                    disabled={isRunning}
                    className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 text-sm font-semibold transition-all duration-200 shadow-sm flex items-center gap-2 bg-white cursor-pointer"
                  >
                    {isRunning && currentAction === 'validate' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                    )}
                    검증하기 (Validate)
                  </button>
                  
                  <button
                    onClick={() => setShowPublishConfirm(true)}
                    disabled={isRunning}
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 text-sm font-semibold transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                  >
                    {isRunning && currentAction === 'publish' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <CloudLightning className="h-4 w-4 text-white" />
                    )}
                    반영하기 (Publish & Apply)
                  </button>
                </div>
              </div>

              {/* Progress & Live Log Panel */}
              {isPanelExpanded && logs.length > 0 && (
                <div className="border border-slate-200/50 rounded-xl bg-slate-50/30 p-5 space-y-4 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Terminal className="h-4 w-4 text-slate-500" />
                      <span>실시간 동기화 상태:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        errorMsg 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : logs.some(l => l.step === 'COMPLETE')
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-indigo-50 text-indigo-600 border border-indigo-100 animate-pulse'
                      }`}>
                        {errorMsg 
                          ? '실패 (Failed)' 
                          : logs.some(l => l.step === 'COMPLETE')
                            ? '완료 (Complete)'
                            : currentAction === 'validate' ? '검증 중...' : '배포 중...'}
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {isPanelExpanded ? '로그 숨기기' : '로그 보이기'} {isPanelExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  {/* Smooth Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                      <span>진행 상황</span>
                      <span className="font-bold text-slate-700">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 border border-slate-200/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ease-out ${
                          errorMsg ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Detailed step lists - reverse ordered for immediate top visibility */}
                  <div className="bg-white border border-slate-200/60 rounded-xl p-5 space-y-3.5 max-h-96 overflow-y-auto shadow-inner/sm">
                    {logs.slice().reverse().map((log, idx) => (
                      <LogItem key={log.step || idx} log={log} idx={idx} />
                    ))}
                  </div>

                  {/* Failure Alert Box */}
                  {errorMsg && (
                    <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-900 shadow-sm">
                      <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm">작업 중 치명적인 에러가 발생했습니다:</h4>
                        <p className="text-xs text-rose-700 mt-1.5 font-mono bg-white/60 p-2.5 rounded border border-rose-100/50 leading-relaxed">{errorMsg}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as DictionaryType)}
          className="w-full space-y-8"
        >
          <TabsList className="bg-slate-100/80 p-1 flex-wrap h-auto w-full justify-start gap-2">
            {Object.entries(DICTIONARY_INFO).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {info.title}
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
              <DictionaryTable type="user" />
            </TabsContent>
            <TabsContent value="decompound" className="m-0 border-none p-0 outline-none">
              <DictionaryTable type="decompound" />
            </TabsContent>
            <TabsContent value="synonym" className="m-0 border-none p-0 outline-none">
              <DictionaryTable type="synonym" />
            </TabsContent>
            <TabsContent value="correction" className="m-0 border-none p-0 outline-none">
              <DictionaryTable type="correction" />
            </TabsContent>
            <TabsContent value="stopword" className="m-0 border-none p-0 outline-none">
              <DictionaryTable type="stopword" />
            </TabsContent>
          </div>
        </Tabs>

        {/* Publish Confirmation Dialog */}
        <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
          <AlertDialogContent className="max-w-md bg-white border border-slate-200/80 rounded-xl shadow-xl p-6">
            <AlertDialogHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600 shadow-inner shrink-0 mb-1">
                <CloudLightning className="h-6 w-6 animate-pulse" />
              </div>
              <AlertDialogTitle className="text-lg font-bold text-slate-900">
                운영 서버 사전 반영 확인
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-800">
                  진짜로 승인된 사전을 원격 Elasticsearch 클러스터 노드들에 영구 배포 및 반영하시겠습니까?
                </p>
                <p>
                  이 작업은 실제 운영 환경에 실시간으로 즉시 동적 적용됩니다. 배포 시작 직전 기존 사전 파일들은 시분초 단위 타임스탬프(`backup/*_YYYYMMDD_HHMMSS.txt`)를 붙여 안전하게 백업 폴더로 저장됩니다.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 flex items-center gap-3">
              <AlertDialogCancel className="w-full sm:w-auto px-4 py-2 text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium cursor-pointer transition-colors">
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
