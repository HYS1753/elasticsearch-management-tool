import Link from 'next/link';
import { Database, Activity, FileText, BookOpen, TrendingUp, ArrowRight, Search, Plus, Eye, BarChart3 } from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Badge } from '@/components/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div></div>
          <h1 className="text-4xl font-bold text-slate-900">
            Elasticsearch Management Tool
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            간편하고 직관적인 UI로 Elasticsearch 클러스터를 관리하세요
          </p>
          <div className="flex gap-3 justify-center items-center pt-4">
            <Badge variant="outline" className="text-sm px-3 py-1">
              실시간 모니터링
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              인덱스 관리
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              문서 검색
            </Badge>
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              빠른 시작 가이드
            </CardTitle>
            <CardDescription>
              Elasticsearch Management Tool을 처음 사용하시나요? 아래 단계를 따라해보세요!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-white">
                <div className="absolute -top-3 -left-3 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                  1
                </div>
                <Activity className="h-8 w-8 text-blue-600 mb-3 mt-2" />
                <h3 className="font-semibold text-slate-900 mb-2">클러스터 상태 확인</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Cluster Info 탭에서 현재 클러스터의 건강 상태, 노드 정보, 리소스 사용량을 실시간으로 확인하세요.
                </p>
                <Link href="/cluster">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    클러스터 보기 <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <div className="relative p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-white">
                <div className="absolute -top-3 -left-3 flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">
                  2
                </div>
                <Database className="h-8 w-8 text-purple-600 mb-3 mt-2" />
                <h3 className="font-semibold text-slate-900 mb-2">인덱스 생성 및 관리</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Indices 탭에서 새로운 인덱스를 생성하고, 기존 인덱스의 상태를 확인하며, 샤드 정보를 관리하세요.
                </p>
                <Link href="/indices">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    인덱스 관리 <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <div className="relative p-4 rounded-lg border bg-gradient-to-br from-green-50 to-white">
                <div className="absolute -top-3 -left-3 flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold">
                  3
                </div>
                <FileText className="h-8 w-8 text-green-600 mb-3 mt-2" />
                <h3 className="font-semibold text-slate-900 mb-2">문서 검색 및 편집</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Documents 탭에서 저장된 문서를 검색하고, 새 문서를 추가하거나, 기존 문서를 수정 및 삭제하세요.
                </p>
                <Link href="/documents">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    문서 검색 <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Cluster Info
              </CardTitle>
              <CardDescription>클러스터 상태를 한눈에 파악하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">실시간 헬스 체크</h4>
                  <p className="text-sm text-slate-600">
                    클러스터의 상태(Green/Yellow/Red)를 실시간으로 모니터링하고, 샤드 분산 현황을 확인할 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">노드 리소스 사용량</h4>
                  <p className="text-sm text-slate-600">
                    각 노드의 CPU, 메모리, 디스크 사용량을 확인하고 성능 병목 지점을 파악하세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Indices Management
              </CardTitle>
              <CardDescription>인덱스를 효율적으로 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex-shrink-0">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">인덱스 생성 및 설정</h4>
                  <p className="text-sm text-slate-600">
                    샤드 개수, 레플리카 설정 등을 지정하여 새로운 인덱스를 쉽게 생성할 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex-shrink-0">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">인덱스 상태 모니터링</h4>
                  <p className="text-sm text-slate-600">
                    각 인덱스의 건강 상태, 문서 수, 저장 용량, 샤드 분산 정보를 실시간으로 확인하세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Documents Management
              </CardTitle>
              <CardDescription>문서를 자유롭게 조회하고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 flex-shrink-0">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">강력한 문서 검색</h4>
                  <p className="text-sm text-slate-600">
                    인덱스를 선택하고 키워드로 문서를 검색하여 원하는 데이터를 빠르게 찾을 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 flex-shrink-0">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">문서 추가 및 수정</h4>
                  <p className="text-sm text-slate-600">
                    JSON 형식으로 새로운 문서를 추가하거나, 기존 문서를 수정 및 삭제할 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-600" />
                Dictionary Management
              </CardTitle>
              <CardDescription>검색 사전을 관리하여 검색 품질을 향상하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex-shrink-0">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">동의어 사전 관리</h4>
                  <p className="text-sm text-slate-600">
                    동의어 사전을 추가하고 관리하여 다양한 표현의 검색어를 처리할 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex-shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">불용어 사전 관리</h4>
                  <p className="text-sm text-slate-600">
                    검색에서 제외할 불용어를 설정하여 검색 결과의 품질을 높일 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-600" />
                Category Boosting
              </CardTitle>
              <CardDescription>카테고리별 가중치를 설정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex-shrink-0">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">검색 우선순위 설정</h4>
                  <p className="text-sm text-slate-600">
                    특정 카테고리의 검색 결과에 가중치를 부여하여 검색 정확도를 높이세요.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 min-h-[66px]">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex-shrink-0">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">부스팅 효과 분석</h4>
                  <p className="text-sm text-slate-600">
                    설정한 부스팅의 효과를 분석하고 최적의 가중치 값을 찾을 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        {/* <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">지금 바로 시작하세요!</h2>
              <p className="text-blue-100 max-w-2xl mx-auto">
                상단 내비게이션 바에서 원하는 기능을 선택하여 Elasticsearch 클러스터 관리를 시작할 수 있습니다.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <Link href="/cluster">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Activity className="h-4 w-4" />
                    클러스터 확인하기
                  </Button>
                </Link>
                <Link href="/indices">
                  <Button size="lg" variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <Database className="h-4 w-4" />
                    인덱스 관리하기
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}

