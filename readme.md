# Elasticsearch Management Tool

실 운영 환경에서 사용 가능한 Elasticsearch 관리 도구입니다. Next.js 15 App Router를 기반으로 구축되었습니다.

> **최신 버전**: Next.js 15 + React 19 + Turbopack

## 주요 기능

- **클러스터 모니터링**: 실시간 클러스터 상태 및 노드 통계 확인
- **인덱스 관리**: 인덱스 생성, 조회, 삭제 및 설정 관리
- **문서 관리**: 문서 검색, 생성, 수정, 삭제 기능
- **사전 관리**: 검색 사전 관리 (구현 예정)
- **카테고리 부스팅**: 검색 결과 카테고리별 가중치 조정 (구현 예정)

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: Elasticsearch 8.x
- **Client**: @elastic/elasticsearch
- **Build Tool**: Turbopack (안정화)

## 시작하기

### 사전 요구사항

- Node.js 18.18 이상 (Node.js 20 LTS 권장)
- npm 9.0 이상
- Elasticsearch 8.x 이상 실행 중

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# .env.local 파일을 열어 Elasticsearch 연결 정보를 입력하세요
```

### 환경 변수 설정

`.env.local` 파일에 다음 정보를 입력하세요:

```env
# Elasticsearch 연결 정보
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password

# 또는 API 키 사용
# ELASTICSEARCH_API_KEY=your_api_key

# TLS 설정
ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED=false
```

### 개발 서버 실행

```bash
# 일반 모드
npm run dev

# Turbopack 모드 (더 빠른 HMR)
npm run dev --turbo
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

> **💡 Tip**: `--turbo` 플래그를 사용하면 최대 96% 빠른 Hot Module Replacement를 경험할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
new/
├── app/                      # Next.js App Router
│   ├── api/                 # API 라우트
│   │   ├── cluster/         # 클러스터 관련 API
│   │   ├── indices/         # 인덱스 관련 API
│   │   └── documents/       # 문서 관련 API
│   ├── cluster/             # 클러스터 정보 페이지
│   ├── indices/             # 인덱스 관리 페이지
│   ├── documents/           # 문서 관리 페이지
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 홈 페이지
│   └── globals.css          # 전역 스타일
├── components/              # React 컴포넌트
│   └── ui/                  # 재사용 가능한 UI 컴포넌트
├── lib/                     # 유틸리티 및 서비스
│   ├── elasticsearch/       # Elasticsearch 클라이언트
│   ├── services/            # 비즈니스 로직 서비스
│   └── utils.ts             # 유틸리티 함수
├── types/                   # TypeScript 타입 정의
│   ├── cluster.ts           # 클러스터 관련 타입
│   ├── indices.ts           # 인덱스 관련 타입
│   ├── document.ts          # 문서 관련 타입
│   └── index.ts             # 타입 export
└── public/                  # 정적 파일

```

## API 엔드포인트

### 클러스터

- `GET /api/cluster/health` - 클러스터 health 정보
- `GET /api/cluster/stats` - 클러스터 통계
- `GET /api/cluster/nodes` - 노드 통계

### 인덱스

- `GET /api/indices` - 인덱스 목록 조회
- `POST /api/indices` - 인덱스 생성
- `GET /api/indices/[name]` - 특정 인덱스 조회
- `DELETE /api/indices/[name]` - 인덱스 삭제

### 문서

- `POST /api/documents/search` - 문서 검색
- `POST /api/documents/index` - 문서 생성
- `GET /api/documents/[index]/[id]` - 문서 조회
- `PUT /api/documents/[index]/[id]` - 문서 수정
- `DELETE /api/documents/[index]/[id]` - 문서 삭제

## 아키텍처

### 서비스 레이어

모든 Elasticsearch 작업은 서비스 레이어를 통해 추상화되어 있습니다:

- **ClusterService**: 클러스터 관련 작업
- **IndexService**: 인덱스 관련 작업
- **DocumentService**: 문서 관련 작업

### API 라우트

Next.js API Routes를 사용하여 서버 측에서 Elasticsearch와 통신합니다. 이를 통해:
- API 키와 같은 민감한 정보를 클라이언트에 노출하지 않음
- CORS 문제 해결
- 에러 핸들링 및 응답 표준화

### 타입 안전성

TypeScript를 사용하여 전체 애플리케이션에서 타입 안전성을 보장합니다.

## 개발

### 새로운 기능 추가

1. `types/`에 필요한 타입 정의
2. `lib/services/`에 서비스 메서드 구현
3. `app/api/`에 API 라우트 생성
4. `app/[feature]/`에 페이지 컴포넌트 구현

### 코드 스타일

- ESLint를 사용한 코드 린팅
- Prettier를 사용한 코드 포매팅 (권장)

## 보안 고려사항

- Elasticsearch 인증 정보는 환경 변수로 관리
- API 라우트를 통해 백엔드에서만 Elasticsearch와 통신
- 프로덕션 환경에서는 TLS/SSL 사용 권장
- 적절한 인증 및 권한 관리 구현 필요

## 라이선스

MIT

## 기여

Pull Request를 환영합니다!

## 문의

문제가 있으시면 GitHub Issues를 통해 문의해주세요.

