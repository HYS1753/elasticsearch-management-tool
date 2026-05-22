'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  BookOpen,
  Activity,
  Shield,
  FileText,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  ListTodo,
  Info,
  Server,
  Layers,
  Database,
  Sparkles,
  BookOpenCheck,
  SearchCode,
} from 'lucide-react';

interface MetricGuide {
  name: string;
  status: 'normal' | 'warning' | 'danger';
  value: string;
  desc: string;
}

interface StepGuide {
  title: string;
  desc: string;
}

interface FieldGuide {
  name: string;
  type: string;
  desc: string;
}

interface DictionaryTypeGuide {
  name: string;
  meaning: string;
  usage: string;
  example: string;
}

interface GuideData {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  overview: string;
  steps: StepGuide[];
  metrics?: MetricGuide[];
  fields?: FieldGuide[];
  dictionaryGuides?: DictionaryTypeGuide[];
  tips: string[];
}

const HELP_GUIDES: Record<string, GuideData> = {
  'Cluster Information': {
    title: '클러스터 정보 (Cluster Information)',
    subtitle: 'Elasticsearch 클러스터 헬스 및 노드 물리 리소스 정보, 샤드 배치 상태 실시간 모니터링',
    icon: Server,
    overview:
      'Elasticsearch 클러스터의 전반적인 상태(Status), 노드 토폴로지 구성, 그리고 인덱스별 샤드 배치 현황(Shard Allocation Grid)을 실시간으로 확인하는 페이지입니다. 클러스터가 고가용성을 유지하고 있는지, 특정 노드에 부하가 집중되어 있지 않은지 실시간으로 진단할 수 있습니다.',
    steps: [
      {
        title: '클러스터 헬스 상태 모니터링',
        desc: 'Green/Yellow/Red 색상과 메인 타이틀을 통해 클러스터가 현재 정상 작동 중인지, 유실된 복제본이 존재하는지 등의 종합 건강도를 한눈에 식별합니다.',
      },
      {
        title: '노드별 하드웨어 사용량 조회',
        desc: 'CPU 사용률, 힙 메모리(Heap Memory) 할당 및 사용량, 디스크 여유 용량(Disk Usage) 수치를 비교하여 리소스 고갈 상태의 노드가 있는지 식별합니다.',
      },
      {
        title: '샤드 토폴로지 분석',
        desc: '각 인덱스의 프라이머리(Primary) 샤드와 레플리카(Replica) 샤드가 어떤 노드에 분산 배치되어 있는지 그리드 격자 형태의 레이아웃으로 실시간 파악합니다.',
      },
      {
        title: '필터 및 숨김 파일 토글',
        desc: '시스템 인덱스(.로 시작하는 인덱스)를 필터링하거나 상태가 정상인 인덱스를 숨겨 복잡한 샤드 토폴로지 그리드를 필요한 부분만 정교하게 필터해 봅니다.',
      },
      {
        title: '샤드 상세 속성 확인',
        desc: '개별 샤드 네모 박스를 클릭하여 해당 샤드의 상태(STARTED/UNASSIGNED), 인덱스명, 샤드 번호, 원본 크기 등의 메타정보를 팝업으로 상세히 조회합니다.',
      },
    ],
    metrics: [
      {
        name: 'JVM Heap Memory Usage',
        status: 'danger',
        value: '85% 이하 유지 권장',
        desc: 'JVM 힙 메모리가 85%를 지속적으로 초과하면 가비지 컬렉션(GC) 빈도가 급격히 상승하며, 100% 도달 시 JVM OOM으로 프로세스가 돌발 다운됩니다.',
      },
      {
        name: 'Disk Used Percent',
        status: 'danger',
        value: '85% 이하 (90% 초과 시 디스크 락)',
        desc: '디스크 사용량이 85%를 넘어가면 노드에 신규 샤드 할당이 차단(Flood Stage Watermark)되며, 90% 이상 도달 시 클러스터 내 모든 인덱스가 강제 읽기 전용(Read-Only)으로 잠기며 검색 외 색인이 마비됩니다.',
      },
      {
        name: 'Indexing Pressure',
        status: 'warning',
        value: '100% 임계 도달 주의',
        desc: '인덱싱 요청이 일시적으로 몰려 메모리 한도에 가까워졌음을 뜻합니다. 100%에 근접하면 클러스터 보호를 위해 추가 색인 요청이 거부(Rejection)될 수 있습니다.',
      },
    ],
    tips: [
      '클러스터가 Yellow 또는 Red 상태가 되었을 때, 복잡한 API 명령어 대신 Elasticsearch Dev Tools에서 GET _cluster/allocation/explain을 호출하시면 미할당 샤드의 정확한 원인 진단을 문서 형식으로 받아볼 수 있습니다.',
      '노드 1개에 샤드가 과도하게 밀집되면 JVM OOM이 쉽게 발생하므로, 인덱스 생성 시 index.routing.allocation.total_shards_per_node 설정을 통해 노드별 최대 샤드 개수를 제한하는 것을 권장합니다.',
    ],
  },
  'Cluster Dashboard': {
    title: '클러스터 대시보드 (Cluster Dashboard)',
    subtitle: '시계열 지표 기반의 클러스터 성능 모니터링, 리소스 분석 및 트래픽 추이 진단',
    icon: TrendingUp,
    overview:
      'Prometheus 및 Elasticsearch API로부터 실시간 수집된 성능 메트릭을 가시성 높은 차트로 시각화하여 제공합니다. CPU 사용량 트렌드, 검색/색인 처리속도 및 지연 시간, 스레드 풀 거부율(Rejections), 가비지 컬렉터(GC) 빈도 등 운영에 필수적인 모니터링 대시보드입니다.',
    steps: [
      {
        title: '조회 시간 범위(Time Range) 지정',
        desc: '우측 상단의 셀렉터에서 최근 1시간, 최근 24시간 또는 Custom(사용자 지정) 날짜/시각 범위를 선택하여 성능 이력을 추적합니다.',
      },
      {
        title: '자동 새로고침 주기 설정',
        desc: 'Refresh 주기를 활성화(예: 10s, 30s)하면 모니터링 데이터가 실시간으로 자동 반영되어 운영 현황을 실시간 파악할 수 있습니다.',
      },
      {
        title: '성공/지연 지표 오버뷰 확인',
        desc: '상단의 KPI Summary 카드를 통해 가용 노드 비율, 검색 레이턴시, 초당 쿼리 수(QPS) 등 핵심 비즈니스 상태를 즉시 진단합니다.',
      },
      {
        title: '상세 메트릭 섹션 확장',
        desc: '리소스 점유율 차트, 검색/인덱싱 처리율 차트, 캐시 성능 및 스레드 풀 지표 등 개별 폴딩 아코디언 영역을 확장하여 심층 분석을 전개합니다.',
      },
    ],
    metrics: [
      {
        name: 'Search/Indexing Latency',
        status: 'danger',
        value: '검색 100ms 이하 / 색인 50ms 이하 권장',
        desc: '검색 지연 시간이 갑작스럽게 튀는(Spike) 경우, 비효율적인 와일드카드 쿼리나 대량의 정렬/집계(Aggregation) 쿼리가 동시 수행되었는지 점검해야 합니다. 색인 지연이 길어지면 벌크(Bulk) 처리 사이즈를 줄이거나 샤드를 분할해야 합니다.',
      },
      {
        name: 'Thread Pool Rejections (Search / Write)',
        status: 'danger',
        value: '0 건 (무조건 유지 권장)',
        desc: '스레드 풀 큐가 꽉 차서 요청이 강제 거절당하는 빈도입니다. 이 수치가 상승하기 시작하면 클라이언트 애플리케이션은 429 Too Many Requests 에러를 전달받게 되므로, 노드 스케일아웃이나 큐 크기 확장 튜닝을 검토해야 합니다.',
      },
      {
        name: 'Cache Hit Rate (Query & Request Cache)',
        status: 'warning',
        value: '높을수록 우수 (메모리 재사용)',
        desc: '필터 쿼리 결과 등이 메모리에 캐싱되어 재사용되는 비율입니다. 히트율이 너무 낮다면 쿼리 작성 시 수시로 바뀌는 매개변수(예: 밀리초 단위 현재 시각)를 필터에 주입하여 캐시 무효화를 유발하고 있지는 않은지 검토하세요.',
      },
      {
        name: 'JVM GC Count & Time',
        status: 'danger',
        value: 'GC 시간 급증 시 클러스터 마비 주의',
        desc: '가비지 컬렉터의 동작 횟수와 누적 소요 시간입니다. Full GC가 오래 지속되면 모든 작업이 멈추는 Stop-the-World 현상으로 이어져 클러스터 노드가 이탈(Drop)될 수 있습니다.',
      },
    ],
    tips: [
      '시스템 부하 분석 시, CPU 차트의 급증 시점과 Search Rate 및 Thread Pool Rejections 그래프의 급증 시점을 동기화하여 비교해 보세요. 쿼리가 밀려서 거절된 것인지, 인덱싱 벌크량이 커서 시스템이 멈춘 것인지 직관적으로 원인을 특정할 수 있습니다.',
    ],
  },
  'Indices Management': {
    title: '인덱스 관리 (Indices Management)',
    subtitle: 'Elasticsearch 인덱스 리스트 조회, 매핑 및 설정 변경, Reindex 수행 및 라이프사이클 통제',
    icon: Database,
    overview:
      '클러스터 상에 배포된 모든 인덱스의 용량, 문서 수, 상태를 모니터링하고, 신규 인덱스를 정의하거나 기존 인덱스의 데이터 매핑(Mapping)/세팅(Settings) 정보 조회, Reindex(재색인), Close/Open(닫기/열기), 물리적 삭제(Delete) 작업을 제어하는 관리소입니다.',
    steps: [
      {
        title: '인덱스 목록 필터링 및 확인',
        desc: '인덱스명을 검색창에 입력하여 조회 범위를 좁히고, 각 인덱스의 상태(open/close), 문서 수, 총 크기(Bytes)를 점검합니다.',
      },
      {
        title: '스키마(Mapping) 및 구성 정보(Settings) 확인',
        desc: '각 행의 상세 메뉴를 통해 해당 인덱스의 필드 속성 정보를 담은 Mapping JSON 및 복제본 수 등을 설정한 Settings JSON을 간편하게 열람합니다.',
      },
      {
        title: '신규 인덱스 생성',
        desc: '상단의 Create Index 버튼을 누르고 샤드 수, 복제본 수 및 필드별 형태소 분석 설정을 JSON 규격에 맞게 정의하여 새 인덱스를 배포합니다.',
      },
      {
        title: 'Reindex(재색인) 실행',
        desc: '기존 인덱스의 매핑 필드 구조를 확장/변경해야 할 때, Reindex 명령 도구를 활용해 데이터를 다운타임 없이 안전하게 신규 스키마 인덱스로 이관시킵니다.',
      },
      {
        title: '인덱스 Close / Delete 통제',
        desc: '사용이 끝난 과거 로그성 데이터는 메모리(Heap) 리소스를 절약하기 위해 Close하여 검색 비대상으로 돌리거나, 영구 삭제(Delete)하여 디스크를 즉시 확보합니다.',
      },
    ],
    fields: [
      {
        name: 'index.number_of_shards',
        type: 'Integer',
        desc: '인덱스를 분할하여 병렬 처리할 프라이머리 샤드의 개수입니다. 인덱스 생성 시에만 지정할 수 있으며 이후 변경이 불가능합니다.',
      },
      {
        name: 'index.number_of_replicas',
        type: 'Integer',
        desc: '데이터 소실 방지 및 검색 처리량 분산을 위한 복제본 샤드 수입니다. 운영 중에도 실시간으로 동적 변경이 가능합니다.',
      },
      { name: 'mappings.properties', type: 'Object', desc: '각 문서 필드의 데이터 타입(Text, Keyword, Date 등)을 설정하는 영역입니다.' },
    ],
    tips: [
      '단일 샤드 크기는 너무 잘게 쪼개거나 너무 비대해져도 성능이 하락합니다. 일반적으로 샤드당 **20GB ~ 40GB**가 유지되도록 인덱스 롤오버(Rollover) 주기를 설정하는 것이 가장 이상적입니다.',
      '대량의 데이터를 빠르게 마이그레이션(리인덱스 포함)할 때는 대상 인덱스의 `index.refresh_interval`을 임시로 `-1`로 설정하고 `index.number_of_replicas`를 `0`으로 비활성화하면 색인 속도가 2~3배 이상 급증합니다.',
    ],
  },
  Documents: {
    title: '도큐먼트 관리 (Documents)',
    subtitle: '인덱스 내 개별 문서의 검색 및 CRUD 처리, Elasticsearch Query DSL 쿼리 테스트 베드',
    icon: FileText,
    overview:
      '선택한 인덱스에 저장된 개별 도큐먼트(문서) 데이터의 상세 내용을 조회하고, Query DSL 기반의 테스트 쿼리를 실행해 볼 수 있는 공간입니다. 문서의 개별 수정, 삭제, 상세 필드 검색과 검색 점수 매칭 상태를 직접 테스트할 수 있습니다.',
    steps: [
      {
        title: '인덱스 선택 및 검색',
        desc: '대상이 되는 인덱스를 상단 셀렉트에서 선택한 뒤, 기본 키워드 검색 또는 ID 필터를 통해 원하는 도큐먼트를 빠르게 찾아냅니다.',
      },
      {
        title: 'Query DSL 작성 및 실행',
        desc: 'Query DSL 에디터를 활용하여 복잡한 Bool 쿼리, Match 쿼리 등을 직접 JSON 형태로 입력해 검색 매칭 결과와 점수 계산을 확인합니다.',
      },
      {
        title: '도큐먼트 등록/수정/삭제',
        desc: 'Add Document 단추를 눌러 JSON 형식으로 새 문서를 삽입하거나, 기존 문서 우측의 편집/삭제 단추를 눌러 개별 문서를 즉각 조작할 수 있습니다.',
      },
      {
        title: '검색 스코어(Score) 분석',
        desc: '결과 목록에서 산출된 _score 값을 대조하여 어떤 도큐먼트가 사용자가 입력한 검색어와 가장 높은 연관성을 가지고 있는지를 판별합니다.',
      },
    ],
    fields: [
      {
        name: '_index',
        type: 'String',
        desc: '도큐먼트가 실제 물리적으로 저장되어 있는 인덱스의 고유 식별 명칭입니다.',
      },
      {
        name: '_id',
        type: 'String',
        desc: '인덱스 내부에서 개별 문서를 고유하게 식별해주는 Key 값입니다. 중복 입력 시 덮어쓰기(Upsert)로 처리됩니다.',
      },
      {
        name: '_score',
        type: 'Float',
        desc: 'Elasticsearch가 BM25 알고리즘에 기초하여 단어의 출현 빈도 및 가중치로 계산한 문서 적합도 점수입니다.',
      },
      {
        name: '_source',
        type: 'Object',
        desc: '사용자가 입력하여 색인된 원본 도큐먼트의 원시 JSON 데이터 오브젝트입니다.',
      },
    ],
    tips: [
      '대량의 도큐먼트 CRUD 시 개별 API 호출보다는 Bulk API를 사용하는 것이 네트워크 비용과 노드 색인 효율성 면에서 월등히 우수합니다.',
      '검색 쿼리가 잘 동작하지 않거나 원하는 대로 점수 정렬이 되지 않는 경우, Query Explain 기능을 함께 사용하면 점수가 도출된 정확한 수학적 공식을 확인할 수 있습니다.',
    ],
  },
  'Dictionary Management': {
    title: '사전 관리 (Dictionary Management)',
    subtitle: '사용자 사전, 복합어, 동의어, 오타 교정 및 금지어 관리와 노드 동기화',
    icon: BookOpen,
    overview:
      'Elasticsearch 형태소 분석기(Nori) 및 검색 필터가 참조하는 단어 사전들을 관리하고 실시간으로 반영하는 시스템입니다. 검색 결과의 품질을 향상하기 위해 단어를 추가하거나, 오타를 보정하고, 불필요한 금지 단어를 거르는 등의 규칙을 직접 편집하고 실제 검색 노드에 배포(Publish)할 수 있습니다.',
    steps: [
      {
        title: '사전 종류 선택',
        desc: '상단 탭을 통해 사용자 사전, 복합어 사전, 동의어 사전, 오타 교정 사전, 금지어 사전을 구분하여 선택합니다.',
      },
      {
        title: '사전 엔트리 편집',
        desc: '선택된 사전 탭 내에서 단어 추가, 편집 또는 불필요한 항목 제거 처리를 GUI 및 목록 편집 도구로 간편히 수행합니다.',
      },
      {
        title: '원격 배포 및 동기화 (Publish)',
        desc: '모든 사전 수정을 마치면 상단의 Publish 단추를 열어 Elasticsearch 분석 노드들에 새로운 텍스트 사전 파일을 실시간으로 재배포 및 로드합니다.',
      },
      {
        title: '분석 결과 테스트 (Analyze)',
        desc: 'Publish 완료 후, Analyzer Test 유틸리티를 사용해 문장을 넣어 사전의 적용 전/후 토큰 분석 결과가 어떻게 바뀌었는지 즉각 검증합니다.',
      },
    ],
    dictionaryGuides: [
      {
        name: '사용자 사전 (User Dictionary)',
        meaning: '신조어, 고유명사, 특정 브랜드명 등이 형태소 분석기(Nori)에 의해 무분별하게 형태소 단위로 쪼개져 검색 품질이 떨어지는 것을 방지하는 사전입니다. Nori 분석기는 기본 사전에 등록되지 않은 고유명사(예: 가수명, 신규 기술명, 사내 브랜드 등)를 "명사"가 아닌 단순 형태소 조합으로 오인해 분해하기 쉬우므로, 이를 단일 명사 토큰으로 보존하기 위해 명사 지정을 해주는 핵심 도구입니다.',
        usage: '• 한 줄에 한 단어씩 입력합니다.\n• 단어 오른쪽에 쉼표(,)와 함께 수치 가중치(단어 비용, Cost)를 추가 지정할 수 있습니다. 이 비용이 낮을수록 노리 분석기가 단어를 분석할 때 해당 형태로 결합할 우선순위가 비약적으로 높아집니다. 비용을 생략하는 경우 형태소 분석기가 단어 길이에 맞춰 적절한 기본 비용을 자동 계산하여 부여하므로, 단순 단어 등록만으로도 동작합니다.',
        example: '# 신조어 및 고유명사 단독 등록 (기본 비용 자동 부여)\n뉴진스\n아이브\n르세라핌\n에스파\n\n# IT 전문 용어 및 사내 고유 브랜드 분해 방지\n가상화폐\n비대면결제\n클라우드네이티브\n\n# 다른 어휘 결합보다 결합 강도를 확실히 보증하고 싶을 때 (비용 가중치 수동 입력, 낮을수록 우선순위 높음)\n카카오톡,100\n네이버페이,120\n토스페이,100',
      },
      {
        name: '복합어 사전 (Decompound Dictionary)',
        meaning: '여러 단어가 결합되어 뭉쳐진 복합명사를 각각의 개별 명사로 쪼개어 색인함으로써, 결합어뿐만 아니라 분해된 개별 단어로 검색하더라도 누락 없이 문서를 찾을 수 있게 해주는 사전입니다. 예를 들어 "인공지능비서"를 "인공지능"과 "비서"로 쪼개 두면, 사용자가 "비서"만 검색해도 해당 문서를 완벽히 검색할 수 있어 검색 재현율(Recall)이 비약적으로 향상됩니다.',
        usage: '• [복합명사] => [공백(스페이스)으로 구분된 개별 단어들] 형태로 입력합니다.\n• 중요: 화살표(=>)의 왼쪽과 오른쪽에는 반드시 최소 한 칸 이상의 빈 공백(스페이스)이 들어가야 파일 분석 문법 에러가 발생하지 않습니다.',
        example: '# 쇼핑몰 및 가전용품 카테고리 복합어 분해\n무선이어폰 => 무선 이어폰\n로봇청소기 => 로봇 청소기\n공기청정기필터 => 공기 청정기 필터\n\n# IT 및 비즈니스 기술 키워드 분해\n자율주행자동차 => 자율 주행 자동차\n인공지능비서 => 인공 지능 비서\n데이터베이스 => 데이터 베이스\n\n# 행정 및 부서/기관명 검색 누락 보완\n고객지원센터 => 고객 지원 센터\n인재개발원 => 인재 개발 원',
      },
      {
        name: '동의어 사전 (Synonym Dictionary)',
        meaning: '동일한 의미를 지녔으나 표기방식이 다르거나 한/영 표기 차이, 약어 표현이 있는 여러 단어를 하나의 동의어 그룹으로 묶어주는 사전입니다. 사용자가 어떤 변형어로 검색하더라도 결과에 동의어가 포함된 문서를 일관되게 노출함으로써 "검색 결과 없음"으로 인한 사용자 이탈을 최소화합니다.',
        usage: '• 양방향 동의어 (상호 호환 매핑): A, B, C 형태로 쉼표로 나열합니다. 나열된 단어 중 어느 하나로 검색하더라도 그룹 내 다른 모든 단어가 포함된 문서를 동일하게 찾을 수 있습니다.\n• 단방향 동의어 (대표어 치환 매핑): A, B => C 형태로 기입합니다. 사용자가 왼쪽의 A나 B를 검색하면 엔진 내부에서 대표어인 C로 자동 치환하여 검색을 수행합니다. 색인 용량을 절약하고 규격을 단일 표준어로 일치시키고자 할 때 매우 유리합니다.',
        example: '# 양방향 동의어 (한/영 표기, 약어 및 줄임말 그룹화)\n노트북, 랩탑, laptop, notebook\n스마트폰, 휴대전화, 핸드폰, 모바일, cellphone\nSKT, SK텔레콤, 에스케이텔레콤\n맥북프로, mbp, macbookpro\n\n# 단방향 동의어 (다양한 유사/하위 기종 표현을 대표 표준어로 치환)\n맥북, 그램, 요가북, 갤럭시북 => 노트북\n아이폰, 갤럭시, 픽셀폰 => 스마트폰\n\n# 신조어 및 음료명 단일 치환\n아아, 아이스아메 => ice_americano\n뜨아, 따아 => hot_americano',
      },
      {
        name: '오타 교정 사전 (Spelling Correction)',
        meaning: '사용자가 키보드 타이핑 중에 범하기 쉬운 한/영 오입력(영문 자판 상태에서 한글 입력 등)이나 맞춤법 에러가 났을 때, 이를 자동으로 올바른 표준어 키워드로 치환하여 정상적인 검색 결과를 돌려주는 사전입니다. 오타가 입력되었을 때 검색 결과가 0건이 나오는 불쾌한 사용자 경험을 사전에 방지합니다.',
        usage: '• [잘못 입력한 오타 단어] => [교정될 올바른 표준 단어] 형태로 작성합니다.\n• 중요: 화살표(=>) 양옆에는 반드시 공백이 존재해야 합니다.',
        example: '# 한/영 키보드 오전환 실수 자동 교정\ngksrmf => 한글\nspdlqj => 네이버\nzakaothr => 카카오톡\ndxotlff => 엘라스틱\n\n# 빈번한 모음/자음 위치 엇갈림 오타 보정\n맥뷱프로 => 맥북프로\n아이패듀 => 아이패드\n스마튼폰 => 스마트폰\n에어팟프록 => 에어팟프로\n\n# 발음대로 잘못 적거나 틀리기 쉬운 맞춤법 보정\n썬글라스 => 선글라스\n선글라쓰 => 선글라스\n케리어 => 캐리어\n레포트 => 리포트',
      },
      {
        name: '금지어/불용어 사전 (Stopword Dictionary)',
        meaning: '조사, 접속사, 지시 대명사 등 문맥상 실질적인 검색 가치를 지니지 않거나, 거의 모든 문서에 아주 빈번하게 등장하여 단어 가중치(BM25)의 구별력을 훼손하는 단어들을 인덱싱 및 검색 대상 토큰에서 강제로 제외시키는 사전입니다. 이를 통해 검색 노이즈를 완벽하게 거르고, 인덱스의 물리 디스크 크기를 대폭 최적화합니다.',
        usage: '• 제외하고 싶은 단어를 한 줄에 하나씩 기입합니다.\n• 기호나 화살표 없이 개별 단어의 줄바꿈(엔터)으로만 구분합니다.',
        example: '# 한글 조사 배제\n은\n는\n이\n가\n을\n를\n의\n에\n로\n으로\n\n# 불필요한 접속어 차단\n그리고\n하지만\n그러나\n또한\n그래서\n\n# 지시 명사 및 무의미한 의존명사 배제\n것\n등\n수\n때\n및\n이것\n저것\n그것',
      },
    ],
    tips: [
      '사전을 반영(Publish)하기 직전, 기존에 원격 노드에 활성화 중이던 텍스트 파일들을 백업 폴더 (`backup/*_YYYYMMDD_HHMMSS.txt`)에 타임스탬프 형식으로 안전하게 이중 보관하므로 문제 발생 시 롤백이 용이합니다.',
      '동의어 파일 작성 시 `A, B => C` 단방향 치환은 인덱스 샤드 크기를 아껴 검색 성능에 유리하며, `A, B, C` 양방향 동의어는 유연함을 넓혀주는 대신 색인 오버헤드가 급증할 수 있으므로 상황에 맞추어 선별 구성하세요.',
    ],
  },
  'Query Explain': {
    title: '쿼리 익스플레인 (Query Explain)',
    subtitle: 'Elasticsearch 검색 랭킹 점수 계산 공식 심층 시각화 및 BM25 매칭 요소 분석',
    icon: SearchCode,
    overview:
      '특정 문서가 사용자 검색어에 대해 왜 해당 순위로 매칭되었는지, Elasticsearch의 BM25 스코어링 수식과 연산 구조를 가독성 높은 분석 트리 형태로 한눈에 보여주는 심층 진단 도구입니다.',
    steps: [
      {
        title: '대상 인덱스 및 문서 지정',
        desc: '분석하고자 하는 대상 인덱스명과 도큐먼트 고유 ID(_id)를 상단 폼에 입력합니다.',
      },
      {
        title: '사용자 검색 쿼리 작성',
        desc: '오른쪽 에디터 창에 실제로 진단하고 싶은 Query DSL 형태의 JSON 검색 쿼리를 명시적으로 작성합니다.',
      },
      {
        title: 'Explain API 호출 및 확인',
        desc: 'Explain 버튼을 누르면 내부 API가 호출되어 산출된 총 스코어와 트리 형태로 구조화된 스코어링 세부 명세를 즉시 렌더링합니다.',
      },
      {
        title: '계산 트리 상세 추적',
        desc: '최상위 스코어에서부터 하위 가중치(IDF, TF, 필드 길이 팩터 등) 계산 노드로 확장해 가며 매칭 점수를 저하시킨 불리한 조건을 찾아 교정합니다.',
      },
    ],
    fields: [
      {
        name: 'score',
        type: 'Float',
        desc: '이 문서가 입력한 검색어와 매칭된 최종 스코어(TF-IDF/BM25 기반)의 수학적 결과 합산치입니다.',
      },
      {
        name: 'description',
        type: 'String',
        desc: '해당 계산 단계의 의미(예: weight in, idf, tf, parameter k1 등)를 영어로 서술한 메타정보입니다.',
      },
      {
        name: 'value',
        type: 'Float',
        desc: '해당 계산 노드에서 산출된 개별적인 가중치 수치입니다. 이 값들이 결합하여 최종 점수를 형성합니다.',
      },
    ],
    tips: [
      '특정 중요 키워드를 입력했는데 관련 없는 엉뚱한 문서가 상단에 보일 경우, 이 도구를 활용해 어떤 불필요한 단어가 높은 점수(IDF)를 가로챘는지 확인한 뒤 불용어로 제거하거나 부스팅(Boosting) 값을 조율하세요.',
      '설명 트리의 깊이(depth)가 깊을수록 복잡한 필드 매핑 및 다중 검색 쿼리를 뜻합니다. 스코어 성능 튜닝 시 깊이가 너무 깊어지는 다중 중첩은 지양하는 것이 좋습니다.',
    ],
  },
  'User Management': {
    title: '사용자 관리 (User Management)',
    subtitle: '계정 신규 발급, 비활성화/삭제 조치 및 RBAC 권한 기반 역할 배정 통제',
    icon: Shield,
    overview:
      'Elasticsearch Management 도구에 접근할 수 있는 사용자를 정의하고, 역할 기반 권한 제어(Role-Based Access Control)를 통해 각 구성원들이 지정된 제어 범위 내에서만 안전하게 시스템을 작동할 수 있도록 접근 권한 매트릭스를 운영하는 페이지입니다.',
    steps: [
      {
        title: '사용자 목록 검색 및 감사',
        desc: '사용자들의 아이디, 이름, 부여된 역할 및 계정 생성 일자를 확인하여 불필요한 휴면 계정이 있는지 감사(Audit)합니다.',
      },
      {
        title: '신규 사용자 계정 등록',
        desc: 'Create User 버튼을 열고 새 담당자의 ID와 이름, 비밀번호 및 알맞은 권한 그룹을 선택하여 안전하게 발급을 완료합니다.',
      },
      {
        title: '역할(Role) 수정 및 퇴사자 계정 삭제',
        desc: '담당 직무 변경 시 역할 변경을 수행하며, 퇴사 등으로 보증이 소멸된 관리자는 우측 Action 메뉴를 통해 삭제하여 부정 접근을 원천 봉쇄합니다.',
      },
    ],
    fields: [
      {
        name: 'ADMIN (관리자)',
        type: 'Role',
        desc: '클러스터 모니터링, 사전 배포 및 원격 동기화, 사용자 계정 생성 및 권한 부여를 포함한 전체 시스템 설정을 조율하는 최상위 역할입니다.',
      },
      {
        name: 'WRITER (편집자)',
        type: 'Role',
        desc: '사전 데이터의 추가/수정, 신규 인덱스 구성, 도큐먼트 CRUD 등 실무적인 읽기/쓰기 작업을 단행할 수 있습니다. 단, 사전의 최종 배포(Publish)나 사용자 계정 생성은 제한됩니다.',
      },
      {
        name: 'VIEWER (조회자)',
        type: 'Role',
        desc: '대시보드 메트릭 관찰, 노드 상태 정보 조회, 사전 엔트리 및 도큐먼트의 내용 검색 등 모든 기능의 조회(Read-Only)만 지원하며 데이터 조작은 불가능합니다.',
      },
    ],
    tips: [
      '계정 분배 시 최소 권한 원칙(Principle of Least Privilege)을 준수하세요. 단순 통계 모니터링이 필요한 부서에는 VIEWER를, 사전 데이터를 단순 정리하는 실무자에게는 WRITER 권한을 부여하고 ADMIN 계정은 최소 인원에게만 한정 배정해야 인재 사고를 미연에 차단할 수 있습니다.',
    ],
  },
};

interface HelpButtonProps {
  pageTitle: string;
}

export function PageHelpGuide({ pageTitle }: HelpButtonProps) {
  const [open, setOpen] = useState(false);
  const guide = HELP_GUIDES[pageTitle];

  if (!guide) {
    return null;
  }

  const GuideIcon = guide.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="relative flex items-center justify-center text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all duration-200 cursor-pointer bg-transparent p-1.5 border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full shrink-0"
          title={`${guide.title} 사용 가이드`}
        >
          {/* 뒤에서 둥글게 퍼져나가는 두근두근 원형 파동 (사각형 잔상이 생기지 않도록 rounded-full 및 transition 최적화) */}
          <span className="absolute inset-0 rounded-full bg-indigo-550/20 dark:bg-indigo-400/20 animate-ping-slow pointer-events-none" />
          <HelpCircle className="relative h-5.5 w-5.5 shrink-0" />
        </button>
      </DialogTrigger>

      <DialogContent className="w-[96vw] h-[92vh] min-h-[650px] max-h-[96vh] sm:max-w-[96vw] md:max-w-[92vw] lg:max-w-[1550px] xl:max-w-[1700px] overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm p-0 gap-0 flex flex-col">
        {/* Style tag injected for the custom slow pulse wave and custom scrollbar */}
        <style>{`
          @keyframes ping-slow {
            0% {
              transform: scale(1);
              opacity: 0.9;
            }
            80%, 100% {
              transform: scale(1.8);
              opacity: 0;
            }
          }
          .animate-ping-slow {
            animation: ping-slow 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          .flat-scroll::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          .flat-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .flat-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          .dark .flat-scroll::-webkit-scrollbar-thumb {
            background: #334155;
          }
        `}</style>

        {/* Modal Header */}
        <DialogHeader className="p-8 pb-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
              <GuideIcon className="h-6 w-6" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                {guide.title}
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200/65 dark:border-slate-800/65 font-semibold leading-normal rounded-md">
                  사용 가이드
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                {guide.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Content - Flat Layout with Fix for scrolling */}
        <div className="flex-1 min-h-0 p-8 pt-4 flex flex-col">
          <Tabs defaultValue="overview" className="flex-1 min-h-0 flex flex-col gap-0">
            <TabsList className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-900 bg-transparent p-0 h-auto justify-start rounded-none mb-6 shrink-0 overflow-x-auto flat-scroll">
              <TabsTrigger
                value="overview"
                className="px-1 py-2.5 rounded-none text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-t-0 data-[state=active]:border-x-0 shadow-none hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 bg-transparent dark:bg-transparent dark:data-[state=active]:border-indigo-400 font-bold"
              >
                <BookOpen className="h-4 w-4 mr-1.5 inline-block" />
                개요
              </TabsTrigger>
              <TabsTrigger
                value="steps"
                className="px-1 py-2.5 rounded-none text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-t-0 data-[state=active]:border-x-0 shadow-none hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 bg-transparent dark:bg-transparent dark:data-[state=active]:border-indigo-400 font-bold"
              >
                <ListTodo className="h-4 w-4 mr-1.5 inline-block" />
                사용 방법
              </TabsTrigger>
              {guide.dictionaryGuides && (
                <TabsTrigger
                  value="dictionaryGuides"
                  className="px-1 py-2.5 rounded-none text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-t-0 data-[state=active]:border-x-0 shadow-none hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 bg-transparent dark:bg-transparent dark:data-[state=active]:border-indigo-400 font-bold"
                >
                  <BookOpenCheck className="h-4 w-4 mr-1.5 inline-block" />
                  사전별 규칙 가이드
                </TabsTrigger>
              )}
              {guide.metrics && (
                <TabsTrigger
                  value="metrics"
                  className="px-1 py-2.5 rounded-none text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-t-0 data-[state=active]:border-x-0 shadow-none hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 bg-transparent dark:bg-transparent dark:data-[state=active]:border-indigo-400 font-bold"
                >
                  <Activity className="h-4 w-4 mr-1.5 inline-block" />
                  지표 분석 가이드
                </TabsTrigger>
              )}
              {guide.fields && (
                <TabsTrigger
                  value="fields"
                  className="px-1 py-2.5 rounded-none text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-t-0 data-[state=active]:border-x-0 shadow-none hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 bg-transparent dark:bg-transparent dark:data-[state=active]:border-indigo-400 font-bold"
                >
                  <Layers className="h-4 w-4 mr-1.5 inline-block" />
                  주요 속성 필드
                </TabsTrigger>
              )}
              <TabsTrigger
                value="tips"
                className="px-1 py-2.5 rounded-none text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:border-t-0 data-[state=active]:border-x-0 shadow-none hover:text-slate-900 dark:hover:text-slate-100 text-slate-500 bg-transparent dark:bg-transparent dark:data-[state=active]:border-indigo-400 font-bold"
              >
                <Lightbulb className="h-4 w-4 mr-1.5 inline-block" />
                운영 꿀팁 (Tips)
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="flex-1 min-h-0 overflow-y-auto pr-3 pb-6 flat-scroll space-y-6 focus:outline-none mt-0">
              <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border-l-4 border-indigo-500 rounded-r-md">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-indigo-500" />
                  이 페이지는 무엇을 위한 도구인가요?
                </h4>
                <p className="text-slate-650 dark:text-slate-350 text-xs md:text-sm font-medium leading-relaxed">
                  {guide.overview}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  기본 준수 사항 및 운영 가용성
                </h4>
                <ul className="list-disc pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-2 font-medium">
                  <li>클러스터의 물리적인 과부하 방지를 위해 분석 지표의 추세를 상시 확인하세요.</li>
                  <li>데이터 CRUD 및 세팅 변경 시 배포 권한이나 인덱스 성격을 감안하여 신중하게 버튼을 동작해야 합니다.</li>
                  <li>모든 변경은 Elasticsearch 클러스터 노드들에 직간접적인 영향을 주므로, 트래픽이 몰리지 않는 한산한 시간대를 활용하세요.</li>
                </ul>
              </div>
            </TabsContent>

            {/* TAB 2: STEPS */}
            <TabsContent value="steps" className="flex-1 min-h-0 overflow-y-auto pr-3 pb-6 flat-scroll focus:outline-none mt-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-900 border-t border-b border-slate-100 dark:border-slate-900">
                {guide.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 py-5">
                    <div className="flex h-5 w-5 items-center justify-center text-xs font-bold text-indigo-500 dark:text-indigo-400 shrink-0 font-mono">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-850 dark:text-slate-200 text-xs md:text-sm">
                        {step.title}
                      </h5>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 3: DICTIONARY GUIDES (Detail specifications per dictionary) */}
            {guide.dictionaryGuides && (
              <TabsContent value="dictionaryGuides" className="flex-1 min-h-0 overflow-y-auto pr-3 pb-6 flat-scroll focus:outline-none mt-0">
                <div className="space-y-4">
                  {guide.dictionaryGuides.map((item, idx) => (
                    <div key={idx} className="p-6 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800/60 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs md:text-sm flex items-center gap-2">
                          <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-500 border border-indigo-200/80 dark:border-indigo-800/80 px-2 py-0.5 rounded-md bg-indigo-50/30 dark:bg-indigo-900/10">
                          규칙 해설
                        </span>
                      </div>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-350 block mb-0.5">사전의 의미:</span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium block whitespace-pre-line leading-relaxed">{item.meaning}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-350 block mb-0.5">사용 방법:</span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium block whitespace-pre-line leading-relaxed">{item.usage}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">이럴 때 이렇게 넣는다 (입력 예시):</span>
                          <pre className="p-4 bg-slate-100/50 dark:bg-slate-900/50 text-[11px] font-mono text-slate-700 dark:text-slate-350 overflow-x-auto whitespace-pre-wrap leading-relaxed border-l-2 border-slate-300 dark:border-slate-700 rounded-r-md">
                            {item.example}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            {/* TAB 4: METRICS */}
            {guide.metrics && (
              <TabsContent value="metrics" className="flex-1 min-h-0 overflow-y-auto pr-3 pb-6 flat-scroll focus:outline-none mt-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-900 border-t border-b border-slate-100 dark:border-slate-900">
                  {guide.metrics.map((metric, idx) => (
                    <div key={idx} className="py-5 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                          {metric.name}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400">
                          권장 기준: {metric.value}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
                        {metric.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            {/* TAB 5: FIELDS */}
            {guide.fields && (
              <TabsContent value="fields" className="flex-1 min-h-0 overflow-y-auto pr-3 pb-6 flat-scroll focus:outline-none mt-0">
                <div className="border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          필드 속성명 (Property)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">
                          타입 (Type)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          상세 설명
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-950 divide-y divide-slate-200 dark:divide-slate-800">
                      {guide.fields.map((field, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="px-4 py-3 text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400">
                            {field.name}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {field.type}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-650 dark:text-slate-400 font-medium leading-relaxed">
                            {field.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            )}

            {/* TAB 6: TIPS */}
            <TabsContent value="tips" className="flex-1 min-h-0 overflow-y-auto pr-3 pb-6 flat-scroll focus:outline-none mt-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-900 border-t border-b border-slate-100 dark:border-slate-900">
                {guide.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-5">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5">
                      <Lightbulb className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-slate-650 dark:text-slate-350 text-xs md:text-sm font-medium leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-end shrink-0">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md cursor-pointer transition-colors shadow-none border-0"
          >
            확인 및 가이드 닫기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
