import Link from 'next/link';
import Image from 'next/image';
import { Activity, FileText, BookOpen, ArrowRight, Search, Plus, Eye, BarChart3, Database, SearchCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 space-y-20">
        
        {/* Hero Section */}
        <div className="text-left space-y-6 py-8 max-w-4xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-100 mb-2">
            <Image 
              src="/es_logo.png" 
              alt="Elasticsearch Logo" 
              width={48} 
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
            Elasticsearch Management
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            간편하고 직관적인 UI로 Elasticsearch 클러스터 헬스 상태를 실시간 탐색하고, 복잡한 인덱스 속성 및 검색 사전을 무중단으로 신속하게 동기화 배포하세요.
          </p>
          <div className="flex gap-3 justify-start items-center pt-2 select-none flex-wrap">
            <Badge variant="outline" className="text-xs px-4 py-1.5 border-slate-200 text-slate-700 bg-white/80 shadow-sm">
              실시간 클러스터 & 샤드 토폴로지
            </Badge>
            <Badge variant="outline" className="text-xs px-4 py-1.5 border-slate-200 text-slate-700 bg-white/80 shadow-sm">
              인덱스 라이프사이클 관리
            </Badge>
            <Badge variant="outline" className="text-xs px-4 py-1.5 border-slate-200 text-slate-700 bg-white/80 shadow-sm">
              실시간 검색 사전 노드 배포
            </Badge>
            <Badge variant="outline" className="text-xs px-4 py-1.5 border-slate-200 text-slate-700 bg-white/80 shadow-sm">
              쿼리 실행계획 시각화
            </Badge>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="space-y-8">
          <div className="text-left space-y-2 max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">빠른 시작 가이드</h2>
            <p className="text-slate-600 text-sm">
              Elasticsearch Management 대시보드를 처음 사용하시나요? 아래 3가지 단계로 기본 분석을 시작해 보세요.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-7xl mr-auto pt-4">
            
            {/* Step 1 */}
            <div className="group relative p-7 rounded-2xl border border-slate-200/60 bg-white hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200/40 transition-all duration-300 flex flex-col h-full">
              <Badge className="bg-blue-50 hover:bg-blue-50 text-blue-700 border-0 font-bold text-[10px] w-fit mb-4 rounded-md px-2.5 py-0.5 select-none">
                STEP 01
              </Badge>
              <Activity className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">클러스터 및 샤드 배정 분석</h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Cluster Info 탭에서 전체 클러스터 건강 상태(Health Status), 마스터 노드 여부 식별, 그리고 각 노드별 샤드 배정 그리드를 실시간으로 탐색할 수 있습니다. JVM 힙 할당량과 CPU 부하 지표도 함께 확인하세요.
              </p>
              <Link href="/cluster-information" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group/link mt-auto pt-2 select-none">
                클러스터 정보 바로가기 
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="group relative p-7 rounded-2xl border border-slate-200/60 bg-white hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-200/40 transition-all duration-300 flex flex-col h-full">
              <Badge className="bg-purple-50 hover:bg-purple-50 text-purple-700 border-0 font-bold text-[10px] w-fit mb-4 rounded-md px-2.5 py-0.5 select-none">
                STEP 02
              </Badge>
              <Database className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">인덱스 생성 및 템플릿 제어</h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Indices Management 탭에서 간편한 UI로 신규 인덱스를 설정하고, 현재 매핑 구조 분석 및 샤드 개수 조정을 효율적으로 관리하세요. 복제본(Replica) 수를 즉시 변경하여 클러스터 백업 가용성을 제어합니다.
              </p>
              <Link href="/indices-management" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 group/link mt-auto pt-2 select-none">
                인덱스 관리 바로가기 
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="group relative p-7 rounded-2xl border border-slate-200/60 bg-white hover:shadow-lg hover:shadow-orange-500/5 hover:border-orange-200/40 transition-all duration-300 flex flex-col h-full">
              <Badge className="bg-orange-50 hover:bg-orange-50 text-orange-700 border-0 font-bold text-[10px] w-fit mb-4 rounded-md px-2.5 py-0.5 select-none">
                STEP 03
              </Badge>
              <BookOpen className="h-8 w-8 text-orange-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">검색 사전 관리 및 실시간 배포</h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Dictionary 탭에서 검색 품질 향상을 위한 교정 규칙 및 복합명사 분해 규칙을 체계적으로 등록하고, 가동 중인 노드들에 무중단 실시간 배포하세요. API 정합성 검증으로 배포 전 완벽한 사전자료 검사 규칙을 지원합니다.
              </p>
              <Link href="/dictionary" className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 group/link mt-auto pt-2 select-none">
                검색 사전 바로가기 
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          <div className="text-left space-y-2 max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">주요 기능</h2>
            <p className="text-slate-600 text-sm">
              Elasticsearch 분산 환경 모니터링 및 검색 품질 최적화를 수행하기 위한 전문 도구 집합
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mr-auto pt-4">
            
            {/* 1. Cluster Info */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Cluster Info</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                클러스터 건강 지표 수집 및 실시간 토폴로지 시각화
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">실시간 샤드 토폴로지 그리드</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      인덱스 패턴 검색 필터와 Hidden/Closed 포함 여부 스위치를 조합하여, 노드별 Primary/Replica/Unassigned 샤드 배치를 실시간 레이아웃 그리드로 즉시 시각화합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">상세 노드 하드웨어 지표</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      각 물리 노드의 Master 자격 유무 표시를 비롯해 CPU 로드 비율, 메모리(JVM Heap 사용량) 점유 지표, 물리 디스크 여유량 및 통계 데이터를 모니터링합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Indices Management */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Indices Management</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                스키마 매핑 속성 통제 및 인덱스 생명주기 관리
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex-shrink-0 mt-0.5">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">인덱스 생성 및 동적 구성 변경</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      초기 샤드 수, 레플리카 분제 개수, 인덱스 코덱 종류 등의 파라미터를 맞춤 구성하여 즉석에서 신규 인덱스를 생성하고 관리합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex-shrink-0 mt-0.5">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">매핑 스키마 및 별칭(Alias) 조회</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      각 인덱스의 복잡한 JSON 매핑 필드 타입(Text, Keyword 등)과 등록된 모든 Alias 별칭 속성 목록을 안전하게 파싱해 줍니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Documents Explorer */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-green-500/5 hover:border-green-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 text-green-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Documents</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                다차원 문서 인덱싱 탐색 및 안전한 CRUD 편집기
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 flex-shrink-0 mt-0.5">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">정밀 텍스트 및 필터 검색</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      특정 인덱스를 지정하여 실시간 조건 검색 및 키워드 매칭 조회를 구동하고, 해당하는 원본 JSON 데이터 문서를 초고속으로 브라우징합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 flex-shrink-0 mt-0.5">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">실시간 JSON 문서 CRUD</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      구조화된 JSON 템플릿 양식을 바탕으로 인덱스 내부에 신규 문서를 안전하게 삽입하거나, 기존 문서 데이터를 실시간 업데이트 및 삭제 통제할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Dictionary Management */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-orange-500/5 hover:border-orange-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-orange-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Dictionary</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                검색 교정/복합명사 분해 사전 및 원클릭 무중단 배포
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex-shrink-0 mt-0.5">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">교정 & 복합어 다차원 사전 관리</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      단어 교정 규칙(Correction 배열)과 복합어 분해(Decompound 단일 토큰 배열) 규칙의 등록/유효성 체크 단계를 웹 콘솔에서 체계적으로 관리합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex-shrink-0 mt-0.5">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">무중단 실시간 노드 동기화 배포</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      사전 정보를 갱신한 직후, 인스턴스 노드를 다시 기동할 필요 없이 실행 중인 모든 노드에 원클릭 명령으로 사전을 실시간 라이브 적용합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Query Explain */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600">
                  <SearchCode className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Query Explain</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                검색 매칭 스코어 연산 상세 트리 해석기
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0 mt-0.5">
                    <SearchCode className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">검색 쿼리 유사도 가중치 역추적</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      작성한 Elasticsearch 검색 쿼리가 구동하여 특정 문서를 매칭했을 때 점수(Score)가 부과되는 전체 수학적 연산 과정을 구조화 트리 형태로 파싱해 줍니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0 mt-0.5">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">검색 노이즈 및 가중치 버그 디버깅</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      원치 않는 노이즈 필터링이 발생했거나 가중치가 잘못된 경우, 명확한 트리 룰 근거를 시각적으로 추적하여 쿼리 필터를 고도화할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
