import { Database, Info } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { IndicesManagementList } from '@/components/indices/indices-management-list';
import { Card, CardContent } from '@/components/ui/card';

export default function IndicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Indices"
        description="Kibana 스타일의 인덱스 관리 화면 1차 구현입니다. 목록 조회, 검색, 상태 필터, 정렬까지 먼저 제공합니다."
      />

      <Card className="border-sky-200/60 bg-gradient-to-r from-sky-50 to-white">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="rounded-2xl bg-sky-100 p-3">
            <Database className="h-5 w-5 text-sky-700" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900">
              <Info className="h-4 w-4" />
              <span className="font-medium">현재 단계</span>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              이번 단계에서는 기존 API 응답을 그대로 활용해서 인덱스 리스트 화면을 완성했습니다.
              다음 단계에서는 여기서 이어서 인덱스 상세 페이지와 settings / mappings / aliases
              화면으로 확장하면 됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      <IndicesManagementList />
    </div>
  );
}