import Link from 'next/link';
import Image from 'next/image';
import { Activity, FileText, BookOpen, TrendingUp, ArrowRight, Search, Plus, Eye, BarChart3, Database } from 'lucide-react';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl mb-2">
            <Image 
              src="/es_logo.png" 
              alt="Elasticsearch Logo" 
              width={48} 
              height={48}
              className="object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
            Elasticsearch Management
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            간편하고 직관적인 UI로 Elasticsearch 클러스터를 관리하세요
          </p>
          <div className="flex gap-3 justify-center items-center pt-2">
            <Badge variant="outline" className="text-sm px-4 py-1.5 border-slate-200 text-slate-700">
              실시간 모니터링
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-1.5 border-slate-200 text-slate-700">
              인덱스 관리
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-1.5 border-slate-200 text-slate-700">
              문서 검색
            </Badge>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">빠른 시작 가이드</h2>
            <p className="text-slate-600">
              Elasticsearch Management를 처음 사용하시나요? 아래 단계를 따라해보세요
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto pt-4">
            <div className="group relative p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200/40 transition-all duration-300">
              <div className="absolute -top-4 -left-4 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-200 to-blue-300 text-white text-sm font-bold shadow-lg shadow-blue-400/20">
                1
              </div>
              <Activity className="h-10 w-10 text-blue-600 mb-4 mt-2" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">클러스터 상태 확인</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Cluster Info 탭에서 현재 클러스터의 건강 상태, 노드 정보, 리소스 사용량을 실시간으로 확인하세요.
              </p>
              <Link href="/cluster">
                <Button variant="outline" size="sm" className="w-full gap-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50">
                  클러스터 보기 <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="group relative p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-200/40 transition-all duration-300">
              <div className="absolute -top-4 -left-4 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-200 to-purple-300 text-white text-sm font-bold shadow-lg shadow-purple-400/20">
                2
              </div>
              <Database className="h-10 w-10 text-purple-600 mb-4 mt-2" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">인덱스 생성 및 관리</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Indices 탭에서 새로운 인덱스를 생성하고, 기존 인덱스의 상태를 확인하며, 샤드 정보를 관리하세요.
              </p>
              <Link href="/indices">
                <Button variant="outline" size="sm" className="w-full gap-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50">
                  인덱스 관리 <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="group relative p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-green-500/5 hover:border-green-200/40 transition-all duration-300">
              <div className="absolute -top-4 -left-4 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-200 to-green-300 text-white text-sm font-bold shadow-lg shadow-green-400/20">
                3
              </div>
              <FileText className="h-10 w-10 text-green-600 mb-4 mt-2" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">문서 검색 및 편집</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Documents 탭에서 저장된 문서를 검색하고, 새 문서를 추가하거나, 기존 문서를 수정 및 삭제하세요.
              </p>
              <Link href="/documents">
                <Button variant="outline" size="sm" className="w-full gap-2 border-slate-200 hover:border-green-300 hover:bg-green-50">
                  문서 검색 <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">주요 기능</h2>
            <p className="text-slate-600">
              Elasticsearch 클러스터 관리를 위한 강력한 기능들
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto pt-4">
            {/* Cluster Info */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Cluster Info</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                클러스터 상태를 한눈에 파악하세요
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">실시간 헬스 체크</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      클러스터의 상태를 실시간으로 모니터링하고, 샤드 분산 현황을 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">노드 리소스 사용량</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      각 노드의 CPU, 메모리, 디스크 사용량을 확인하고 성능 병목 지점을 파악하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Indices Management */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Indices Management</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                인덱스를 효율적으로 관리하세요
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex-shrink-0 mt-0.5">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">인덱스 생성 및 설정</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      샤드 개수, 레플리카 설정 등을 지정하여 새로운 인덱스를 쉽게 생성할 수 있습니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex-shrink-0 mt-0.5">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">인덱스 상태 모니터링</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      각 인덱스의 건강 상태, 문서 수, 저장 용량, 샤드 분산 정보를 실시간으로 확인하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Management */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-green-500/5 hover:border-green-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 text-green-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Documents Management</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                문서를 자유롭게 조회하고 관리하세요
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 flex-shrink-0 mt-0.5">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">강력한 문서 검색</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      인덱스를 선택하고 키워드로 문서를 검색하여 원하는 데이터를 빠르게 찾을 수 있습니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 flex-shrink-0 mt-0.5">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">문서 추가 및 수정</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      JSON 형식으로 새로운 문서를 추가하거나, 기존 문서를 수정 및 삭제할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dictionary Management */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-orange-500/5 hover:border-orange-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-orange-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Dictionary Management</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                검색 사전을 관리하여 검색 품질을 향상하세요
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex-shrink-0 mt-0.5">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">동의어 사전 관리</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      동의어 사전을 추가하고 관리하여 다양한 표현의 검색어를 처리할 수 있습니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex-shrink-0 mt-0.5">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">불용어 사전 관리</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      검색에서 제외할 불용어를 설정하여 검색 결과의 품질을 높일 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Boosting */}
            <div className="p-6 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30 hover:shadow-lg hover:shadow-pink-500/5 hover:border-pink-200/40 transition-all duration-300 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-50 text-pink-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Category Boosting</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                카테고리별 가중치를 설정하세요
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex-shrink-0 mt-0.5">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">검색 우선순위 설정</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      특정 카테고리의 검색 결과에 가중치를 부여하여 검색 정확도를 높이세요.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex-shrink-0 mt-0.5">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">부스팅 효과 분석</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      설정한 부스팅의 효과를 분석하고 최적의 가중치 값을 찾을 수 있습니다.
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
