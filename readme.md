# 엘라스틱서치 관리 도구 UI (management_ui)

본 서비스는 **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS**를 기반으로 구축된 최첨단 **엘라스틱서치 클러스터 관리 및 사전 배포 웹 애플리케이션**입니다.

검색 엔진 노드 모니터링, 인덱스 제어, 문서 검색뿐만 아니라, 오프라인 승인 대기 단계의 사전을 엘라스틱서치 실서버에 동기화하고 이를 실시간 터미널 뷰어로 스트리밍 추적할 수 있는 고성능 관리자 도구를 탑재하고 있습니다.

---

## 🏗️ 시스템 아키텍처 및 디자인 패턴 (Architecture & Design Patterns)

본 프론트엔드 프로젝트는 유지보수성과 보안성, 계층의 명확성을 높이기 위해 다음과 같은 엄격한 설계 원칙을 준수합니다:

### 1. 서비스 레이어 패턴 (Service Layer Pattern)
*   모든 외부 HTTP 요청 및 API 호출 로직은 컴포넌트 내부에서 마구잡이로 작성되지 않고, `lib/services/` 디렉토리 아래의 전용 서비스 객체들(싱글톤) 내에 철저히 캡슐화됩니다.
*   **대표 서비스**:
    *   [dictionary.service.ts](file:///Users/hy/git/elasticsearch-management/management_ui/lib/services/dictionary.service.ts): 사전 검색, CRUD, 그리고 실시간 스트리밍 fetch 처리
    *   [indices.service.ts](file:///Users/hy/git/elasticsearch-management/management_ui/lib/services/indices.service.ts): 인덱스 배치, 상세 정보, 인덱스 액션 제어
    *   [cluster.service.ts](file:///Users/hy/git/elasticsearch-management/management_ui/lib/services/cluster.service.ts): 클러스터 및 노드 헬스 지표 로드
    *   [auth.service.ts](file:///Users/hy/git/elasticsearch-management/management_ui/lib/services/auth.service.ts): JWT 인증 제어

### 2. Next.js API Routes 프록시 중계 패턴
*   클라이언트 브라우저가 직접 백엔드 API 서버의 원격 주소에 접속하지 않고, `app/api/` 경로 밑의 Next.js API Routes를 통해 안전하게 우회 접속합니다.
*   이를 통해 외부 API 키나 백엔드 포트 주소를 브라우저에 노출시키지 않는 **보안 경계**를 확립하고 CORS 문제를 근본적으로 해소합니다.
*   특히, 실시간 사전 동기화 스트림인 `/api/dictionary-action/{action}/stream` 경로는 서버 단에서 보안 쿠키(`auth_token`)를 읽어와 인증 헤더를 안전하게 재구성한 후 백엔드 SSE 서버와 통신하는 역할을 수행합니다.

### 3. 역할 기반 접근 제어 (RBAC - Role-Based Access Control)
*   사용자 등급은 `Viewer`, `Writer`, `ADMIN`의 3가지 권한으로 명확히 나뉩니다.
*   로그인 후 클라이언트 쿠키에 탑재된 JWT 토큰 페이로드를 파싱하여 권한 등급을 유도하며, 권한에 맞지 않는 UI 조작 버튼을 원천 비활성화하거나 차단합니다.
    *   *Viewer*: 모니터링 및 사전/문서 단순 조회만 허용
    *   *Writer*: 사전 및 문서의 생성/수정/삭제 권한 부여 (스테이징 단계 반영)
    *   *ADMIN*: 사전 데이터의 실서버 배포/반영(`Publish`) 권한, 인덱스 상태 변경(Open/Close/Reindex) 제어 권한

---

## 🌟 주요 핵심 기능 (Key Features)

### 1. 클러스터 및 노드 모니터링 (Cluster & Node Status)
*   Elasticsearch 클러스터의 전반적인 상태 지표(Green, Yellow, Red)를 메인 대시보드에서 시각적으로 직관적으로 확인합니다.
*   각 물리 노드별 CPU 사용량, 디스크 할당 현황, JVM 메모리 사용률을 모니터링하여 병목 지점을 추적할 수 있습니다.

### 2. 인덱스 관리 및 샤드 배치 시각화 (Index Placement & Settings)
*   전체 인덱스 목록과 크기, 활성 샤드 개수를 그리드로 출력합니다.
*   **샤드 배치 테이블 (Indices Placement)**: 물리 노드별로 주 샤드(Primary Shards)와 복제 샤드(Replica Shards)가 어떻게 배분되어 있는지 매핑 그래프를 시각화합니다.
*   **인덱스 제어 액션**: 어드민 권한을 바탕으로 인덱스의 `Close`(일시 비가동), `Open`(가동), `Refresh`(메모리 버퍼 물리 디스크 플러시), `Reindex`(대규모 데이터 재색인) 동작을 간편히 제어할 수 있습니다.

### 3. 고성능 형태소 사전 관리 시스템 (Dictionary Stage Management)
*   사용자 명사 사전(`User`), 복합어 사전(`Decompound`), 동의어 사전(`Synonym`), 오타 교정 사전(`Correction`), 불용어 사전(`Stopword`)의 5가지 형태소 사전을 완벽하게 관리합니다.
*   모든 사전 데이터는 **Draft (임시)** -> **APPROVED (승인)** -> **APPLIED (실서버 배포 완료)** 의 정형화된 수명 주기를 투명하게 마킹합니다.

### 4. 실시간 사전 배포 터미널 콘솔 (Live Sync & Deploy Manager)
*   **ADMIN 전용 대시보드 탑재**: 사전 관리 탭 최상단에 검증 및 반영을 제어할 수 있는 프리미엄 조작 바가 마운트됩니다.
*   **Server-Sent Events (SSE) 실시간 바인딩**:
    *   "검증하기" 또는 "반영하기" 버튼 클릭 시, Next.js 라우트 프록시를 통해 백엔드와 Server-Sent Events 지속성 연결을 생성합니다.
    *   진행 상황에 따라 백엔드에서 뿜어주는 세부 단계 로그를 실시간 터미널 스타일 다크 모드 텍스트 뷰어로 스트리밍 출력합니다.
    *   각 공정 단계의 완성도 수치에 비례하여 **실시간 진행률 바(Progress Bar)**가 0%에서 100%까지 자연스럽게 갱신되며, 도중에 오류 발생 시 직관적인 에러 박스가 활성화됩니다.

---

## ⚙️ 환경 변수 설정 (Environment Variables)

### 1. 환경 변수 파일 종류 및 우선순위 (Next.js Precedence)
Next.js는 기동 모드(Development, Production)에 따라 루트 디렉토리에 정의된 환경 변수 파일들을 아래 순서로 읽어들여 덮어씌웁니다 (위쪽에 있을수록 높은 우선순위를 가집니다):

1. **`process.env` (운영체제/기동 쉘에 직접 정의된 환경 변수)** ── *[최상위 우선순위]*
2. **`.env.development.local`** / **`.env.production.local`** (로컬 테스트용 기동 환경별 덮어쓰기)
3. **`.env.local`** (깃에 올리지 않는 로컬 전용 공통 설정)
4. **`.env.development`** / **`.env.production`** (각각 `npm run dev` 및 `npm start` 시점에 적용되는 파일)
5. **`.env`** (기본 공통 설정 파일)

> [!NOTE]
> 다중 배포 대상 원격 노드 서버들의 개별 SSH 접속 정보(ID/비밀번호 혹은 SSH Key 파일 경로 등)는 **백엔드 API 서버의 `.env` 파일** 내 `SSH_SERVERS` 환경 변수에서 JSON 배열 구조로 구성해 주시기 바랍니다.

---

### 2. 브라우저 노출 경계 (`NEXT_PUBLIC_`) 규칙
- **서버사이드 전용 변수 (`CLUSTER_API_URL`)**:
  - `NEXT_PUBLIC_` 접두사가 없는 변수는 Next.js의 SSR(Server-side Rendering) 혹은 API Routes 프록시 단에서만 참조할 수 있으며 브라우저에는 전달되지 않아 안전합니다.
- **클라이언트 전용 변수 (`NEXT_PUBLIC_*`)**:
  - `NEXT_PUBLIC_APP_NAME` 등은 브라우저(Client Components) 상에서 직접 접근할 수 있도록 허용하는 변수입니다. Next.js 빌드 시점에 JavaScript 소스 코드 내부에 **정적 텍스트로 인라인(Static Inlining)** 처리됩니다.

---

### 3. `.env` 파일 대신 기동(실행) 시점에 동적 주입하는 방법
Next.js 프론트엔드 환경은 빌드 시점에 코드 바인딩이 일어나므로, 단순히 기동 시점(`npm start` 또는 `docker run -e`)에 환경 변수를 넣는 방식이 제대로 동작하지 않을 수 있습니다. 이를 해결하기 위한 실무적인 동적 주입 가이드는 다음과 같습니다:

#### 방안 A: Docker 빌드 인수(Build Arguments) 주입 ── *[가장 추천하는 컨테이너 배포 방식]*
제공된 `Dockerfile`은 멀티 스테이지 빌드 내에 `ARG`를 수용하도록 설계되어 있습니다. Docker 이미지를 빌드하는 명령어 실행 시점에 주입할 수 있습니다:
```bash
docker build \
  --build-arg CLUSTER_API_URL="http://192.168.0.10:18080" \
  --build-arg NEXT_PUBLIC_APP_NAME="Enterprise Search Admin" \
  --build-arg NEXT_PUBLIC_APP_VERSION="1.5.0" \
  -t es-management-ui:latest .
```
이 방식은 기동 환경(Dev, Staging, Prod)별로 이미지를 독립 빌드할 때 아주 유용하고 깔끔합니다.

#### 방안 B: 런타임 설정 (Runtime Configuration) 사용
이미 빌드된 단일 Docker 이미지 하나를 생성한 후, 컨테이너 기동 실행 시점(`docker run -e`)에 환경 변수를 다이나믹하게 교체하여 실행하고자 하는 경우에 유용합니다.
1. `next.config.js`를 수정하여 런타임 설정을 매핑합니다:
   ```javascript
   module.exports = {
     publicRuntimeConfig: {
       NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
       NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
     },
     serverRuntimeConfig: {
       CLUSTER_API_URL: process.env.CLUSTER_API_URL,
     }
   };
   ```
2. 코드 상에서 `process.env` 직접 호출 대신 Next.js의 `getConfig()`를 임포트하여 사용하도록 수정합니다:
   ```typescript
   import getConfig from 'next/config';
   const { publicRuntimeConfig } = getConfig();
   const appName = publicRuntimeConfig.NEXT_PUBLIC_APP_NAME;
   ```
이 방식을 적용하면 `docker run -e CLUSTER_API_URL=http://prod-url ...` 과 같이 기동 시 입력한 운영 환경변수가 런타임에 동적으로 해석됩니다.

#### 방안 C: 기동 시 쉘 스크립트 기반 플레이스홀더 치환 (Static Container Hybrid)
빌드 시점에 가상의 식별 텍스트(예: `__PLACEHOLDER_API_URL__`)를 번들에 박아 빌드한 뒤, 컨테이너 실행 엔트리포인트(`entrypoint.sh`) 스크립트 실행 단계에서 `sed` 등을 사용하여 기동 시 주입받은 실제 `process.env` 값으로 교체하여 서버를 켜는 트릭입니다:
```bash
# entrypoint.sh 예시
find .next -type f -exec sed -i "s|__PLACEHOLDER_API_URL__|${CLUSTER_API_URL}|g" {} +
exec npm start
```

---

## 🚀 프로젝트 기동법 (Quick Start Guide)

### 1. 사전 요구사항 (Prerequisites)
*   Node.js 18.x 이상 (Node.js 20 LTS 버전 강력 권장)
*   npm 9.x 이상 또는 yarn

### 2. 패키지 설치 및 구동
```bash
# 의존성 모듈 설치
npm install

# 로컬 개발 서버 기동 (Turbopack 탑재로 초고속 HMR 지원)
npm run dev --turbo

# 프로덕션 번들 빌드 및 배포 기동
npm run build
npm start
```

서버 구동 후 웹 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 사용하실 수 있습니다. (최초 로그인 아이디/비밀번호 필요)

---

## 📁 프로젝트 구조 명세 (Directory Structure)

```
management_ui/
├── app/
│   ├── api/                      # Next.js API Routes (백엔드 프록시 레이어)
│   │   ├── auth/                 # 로그인 및 세션 쿠키 제어
│   │   └── dictionary-action/    # 사전 검증/배포 실시간 SSE 중계 프록시
│   ├── cluster/                  # 클러스터 통계 모니터링 페이지
│   ├── dictionary/               # 사전 관리 메인 보드 (Sync & Deploy 포함)
│   ├── documents/                # 엘라스틱서치 문서 브라우징 및 검색 보드
│   ├── indices/                  # 샤드 배치 맵 및 인덱스 액션 관리 페이지
│   ├── layout.tsx                # 글로벌 프리미엄 네비게이션 헤더 레이아웃
│   └── page.tsx                  # 인덱스 페이지 (대시보드 진입점)
├── components/
│   ├── common/                   # 다크모드 대응 공통 헤더 카드
│   ├── dictionary/               # 5대 사전 통합 테이블 & 상태 제어 모달
│   └── ui/                       # Shadcn UI 기반 프리미엄 카드, 다이얼로그
├── lib/
│   ├── client-api/               # 클라이언트 사이드 토큰 해독 모듈
│   ├── services/                 # 핵심 아키텍처 서비스 레이어 (DictionaryService 등)
│   └── utils.ts                  # Tailwind 클래스 병합 유틸
└── types/                        # 각 도메인 영역별 TypeScript 인터페이스 명세
```
