# 설치 및 실행 가이드

## 1. 의존성 설치

```bash
cd new
npm install
```

## 2. 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다. Elasticsearch 연결 정보를 확인하고 필요시 수정하세요:

```env
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED=false
```

## 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하세요.

## 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 주요 변경 사항

### 기존 (Figma 기반 목업)
- Vite + React로 구성
- 모든 데이터가 하드코딩된 목업
- 클라이언트 사이드 렌더링만 지원
- 실제 Elasticsearch와 연동 불가

### 신규 (Next.js 기반 실 운영 버전)
- Next.js 14 App Router로 전환
- 실제 Elasticsearch API와 완전히 연동
- 서버/클라이언트 하이브리드 렌더링
- TypeScript로 완전한 타입 안전성 보장
- 실 운영 환경에서 즉시 사용 가능

## 구현된 기능

### ✅ 클러스터 관리 (`/cluster`)
- 실시간 클러스터 health 모니터링
- 노드별 CPU, 메모리, 디스크 사용률
- 샤드 상태 및 통계

### ✅ 인덱스 관리 (`/indices`)
- 인덱스 목록 조회
- 새 인덱스 생성 (샤드/레플리카 설정 포함)
- 인덱스 삭제
- 인덱스 health 및 상태 확인

### ✅ 문서 관리 (`/documents`)
- 인덱스별 문서 검색
- 새 문서 생성 (JSON 형식)
- 문서 상세 조회
- 문서 삭제
- 검색 쿼리 지원

### 🔄 추후 구현 예정
- Dictionary Manager: 검색 사전 관리
- Category Boosting: 카테고리별 검색 가중치 조정
- 문서 수정 기능
- 벌크 작업 지원
- 고급 검색 쿼리 빌더

## API 구조

### Cluster APIs
- `GET /api/cluster/health` - 클러스터 상태
- `GET /api/cluster/stats` - 클러스터 통계
- `GET /api/cluster/nodes` - 노드 통계

### Index APIs
- `GET /api/indices` - 인덱스 목록
- `POST /api/indices` - 인덱스 생성
- `GET /api/indices/[name]` - 인덱스 상세
- `DELETE /api/indices/[name]` - 인덱스 삭제

### Document APIs
- `POST /api/documents/search` - 문서 검색
- `POST /api/documents/index` - 문서 생성
- `GET /api/documents/[index]/[id]` - 문서 조회
- `PUT /api/documents/[index]/[id]` - 문서 수정
- `DELETE /api/documents/[index]/[id]` - 문서 삭제

## 아키텍처 장점

1. **보안**: API 키가 클라이언트에 노출되지 않음
2. **타입 안전성**: TypeScript로 전체 코드베이스 커버
3. **확장성**: 서비스 레이어 패턴으로 쉽게 기능 추가 가능
4. **유지보수성**: 관심사 분리(API Routes, Services, Components)
5. **성능**: Next.js SSR/SSG 활용 가능

## 트러블슈팅

### Elasticsearch 연결 오류
- Elasticsearch가 실행 중인지 확인
- `.env.local`의 URL이 정확한지 확인
- 인증 정보(username/password 또는 API key)가 올바른지 확인

### TypeScript 오류
- `npm install`을 다시 실행
- VSCode를 재시작

### 포트 충돌
- 3000 포트가 이미 사용 중이면 `PORT=3001 npm run dev`로 다른 포트 사용

## 디렉터리 비교

```
기존 (src/)           →    신규 (new/)
─────────────────────────────────────────
src/App.tsx          →    app/page.tsx
src/components/      →    components/
(없음)               →    app/api/ (NEW)
(없음)               →    lib/services/ (NEW)
(없음)               →    types/ (NEW)
vite.config.ts       →    next.config.js
```

## 다음 단계

1. Elasticsearch 클러스터 준비
2. `npm install` 실행
3. `.env.local` 설정 확인
4. `npm run dev` 실행
5. 브라우저에서 http://localhost:3000 접속
6. 각 기능 테스트 및 확인

문제가 있으면 README.md를 참고하거나 이슈를 등록해주세요!
