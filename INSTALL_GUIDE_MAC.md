# 🍎 Mac에서 처음부터 설치하고 실행하기 (완전 초보자 가이드)

> **최신 업데이트**: Next.js 15 (2024년 10월 출시) + React 19 지원

## 📋 1단계: 필수 소프트웨어 설치

### 1️⃣ Homebrew 설치 (맥 패키지 관리자)

터미널(`⌘ + Space` → "터미널" 입력)을 열고 다음 명령어를 실행하세요:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**설치 후 중요!** 터미널에 표시되는 지시사항을 따라 PATH를 설정하세요:

```bash
# Intel Mac의 경우
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc

# Apple Silicon (M1/M2/M3)의 경우
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

**확인:**
```bash
brew --version
# Homebrew 4.x.x 같은 버전이 출력되면 성공!
```

---

### 2️⃣ Node.js 20 LTS 설치

```bash
# Node.js 20 (최신 LTS 버전) 설치
brew install node@20

# 설치 확인
node --version   # v20.x.x 출력되어야 함
npm --version    # 10.x.x 출력되어야 함
```

**중요 사항:**
- ✅ Next.js 15는 **Node.js 18.18 이상** 필요
- ✅ Node.js 20 LTS 사용 강력 권장 (2026년까지 지원)
- ❌ Node.js 16은 지원 종료 (2023년 9월)

**만약 다른 버전의 Node.js가 이미 설치되어 있다면:**
```bash
# 현재 버전 확인
node --version

# 기존 버전 제거 후 재설치
brew uninstall node
brew install node@20

# 또는 nvm 사용 (여러 버전 관리)
brew install nvm
nvm install 20
nvm use 20
```

---

### 3️⃣ Elasticsearch 설치 (로컬 개발용)

#### 옵션 A: Docker로 설치 (✨ 권장 - 가장 쉬움)

```bash
# 1. Docker Desktop 설치
brew install --cask docker

# 2. Docker Desktop 앱 실행
# Applications 폴더에서 Docker 앱을 찾아 실행하세요
# 또는: open -a Docker

# 3. Docker가 실행되면 (상단 메뉴바에 고래 아이콘 표시)
# Elasticsearch 8.11 실행
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# 4. 실행 확인 (30초 정도 대기 후)
curl http://localhost:9200

# 성공하면 JSON 응답이 보입니다:
# {
#   "name" : "...",
#   "cluster_name" : "docker-cluster",
#   "version" : {
#     "number" : "8.11.0",
#     ...
#   }
# }
```

**Docker 유용한 명령어:**
```bash
# Elasticsearch 상태 확인
docker ps

# 로그 확인
docker logs elasticsearch

# 중지
docker stop elasticsearch

# 시작
docker start elasticsearch

# 완전히 삭제
docker rm -f elasticsearch
```

#### 옵션 B: Homebrew로 직접 설치

```bash
# Elasticsearch 설치
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full

# Elasticsearch 시작
brew services start elastic/tap/elasticsearch-full

# 실행 확인
curl http://localhost:9200

# 중지
brew services stop elastic/tap/elasticsearch-full
```

---

## 🚀 2단계: 프로젝트 설정 및 실행

### 1️⃣ 프로젝트 디렉터리로 이동

```bash
cd "/Users/hy/git/Elasticsearch Management Tool/new"
```

---

### 2️⃣ 의존성 설치

```bash
# npm 캐시 정리 (선택사항, 문제 발생시)
npm cache clean --force

# 모든 의존성 설치 (Next.js 15 + React 19)
npm install
```

**예상 설치 시간**: 2-5분

**설치 중 나올 수 있는 메시지:**
- ⚠️ Warning 메시지는 대부분 무시해도 됩니다
- ✅ "added XXX packages" 메시지가 나오면 성공

**문제 발생 시:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 또는 특정 버전으로 강제 설치
npm install --force
```

---

### 3️⃣ 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다. 내용을 확인하세요:

```bash
# 파일 내용 확인
cat .env.local
```

**내용:**
```env
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED=false
```

**Docker로 Elasticsearch를 실행한 경우** (보안 비활성화됨):
```env
ELASTICSEARCH_URL=http://localhost:9200
# USERNAME과 PASSWORD 라인은 주석 처리하거나 삭제
# ELASTICSEARCH_USERNAME=elastic
# ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_TLS_REJECT_UNAUTHORIZED=false
```

**파일 수정이 필요하면:**
```bash
# nano 에디터로 열기
nano .env.local

# 수정 후 저장: Ctrl + O, Enter, Ctrl + X

# 또는 VSCode로 열기
code .env.local
```

---

### 4️⃣ 개발 서버 실행

```bash
# 일반 모드
npm run dev

# 또는 Turbopack 모드 (더 빠름, Next.js 15 새 기능)
npm run dev --turbo
```

**성공 메시지:**
```
▲ Next.js 15.0.3
- Local:        http://localhost:3000
- Environments: .env.local

✓ Starting...
✓ Ready in 2.1s
```

---

### 5️⃣ 브라우저에서 확인

브라우저를 열고 다음 주소로 접속:

```
http://localhost:3000
```

**접속 화면:**
- 🏠 홈: 기능 개요
- 📊 Cluster: http://localhost:3000/cluster
- 📁 Indices: http://localhost:3000/indices
- 📄 Documents: http://localhost:3000/documents

---

## 🔧 3단계: 문제 해결 (Troubleshooting)

### ❌ 문제 1: "command not found: node"

```bash
# Node.js 재설치
brew uninstall node@20
brew install node@20

# PATH 확인
echo $PATH

# Node.js 위치 확인
which node
# /opt/homebrew/bin/node (Apple Silicon)
# /usr/local/bin/node (Intel)

# PATH에 추가 (필요시)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

### ❌ 문제 2: "ECONNREFUSED" - Elasticsearch 연결 불가

```bash
# Elasticsearch가 실행 중인지 확인
curl http://localhost:9200

# 안되면:
# 1) Docker 확인
docker ps
# elasticsearch 컨테이너가 보여야 함

# 2) 컨테이너 재시작
docker restart elasticsearch

# 3) 로그 확인
docker logs elasticsearch

# 4) 완전히 재시작
docker rm -f elasticsearch
docker run -d --name elasticsearch -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

---

### ❌ 문제 3: 포트 3000이 이미 사용 중

```bash
# 다른 포트로 실행
PORT=3001 npm run dev

# 또는 3000 포트 사용 프로세스 찾아서 종료
lsof -ti:3000
# 숫자(PID) 출력됨

# 프로세스 종료
lsof -ti:3000 | xargs kill -9

# 확인
lsof -ti:3000
# 아무것도 출력되지 않으면 성공
```

---

### ❌ 문제 4: npm install 중 권한 오류

```bash
# npm 권한 수정
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# 다시 설치
npm install

# 또는 sudo 없이 global 설치 경로 변경
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

---

### ❌ 문제 5: React 19 타입 오류

Next.js 15는 React 19를 사용하므로 일부 타입 변경이 있을 수 있습니다.

```bash
# 타입 정의 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 캐시 정리
rm -rf .next
npm run dev
```

---

### ❌ 문제 6: "Module not found" 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json .next
npm install

# 캐시 정리
npm cache clean --force
npm install
```

---

## 📱 4단계: 애플리케이션 사용하기

### 실행 화면 구성

1. **홈페이지** (`http://localhost:3000`)
   - 각 기능에 대한 개요
   - 네비게이션 탭

2. **Cluster Info** (`/cluster`)
   - ✅ 클러스터 상태 (Green/Yellow/Red)
   - ✅ 노드별 CPU, 메모리, 디스크 사용률
   - ✅ 샤드 통계
   - 🔄 실시간 모니터링

3. **Indices** (`/indices`)
   - ✅ 인덱스 목록 조회
   - ✅ 새 인덱스 생성
   - ✅ 인덱스 삭제
   - ✅ Health 상태 확인

4. **Documents** (`/documents`)
   - ✅ 인덱스별 문서 검색
   - ✅ 새 문서 생성 (JSON)
   - ✅ 문서 상세 조회
   - ✅ 문서 삭제

---

## 🛑 5단계: 서버 중지

개발 서버를 중지하려면:

```bash
# 터미널에서 Ctrl + C 누르기
# 또는
⌘ + C
```

**Elasticsearch 중지:**
```bash
# Docker 사용시
docker stop elasticsearch

# Homebrew 사용시
brew services stop elastic/tap/elasticsearch-full
```

---

## 📦 6단계: 프로덕션 빌드 (배포 준비)

실제 운영 환경에 배포하기 전:

```bash
# 프로덕션 빌드 생성
npm run build

# 빌드 결과 확인
# ✓ 각 페이지별 빌드 정보 표시
# - ○ Static: 정적 페이지
# - λ Server: 서버 렌더링
# - ƒ Dynamic: 동적 페이지

# 프로덕션 서버 실행
npm start

# 브라우저에서 http://localhost:3000 확인
```

---

## 🎯 빠른 시작 요약

**완전 초보자용 복사-붙여넣기 가이드:**

```bash
# 1. Homebrew 설치 (이미 있으면 생략)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js 20 설치
brew install node@20

# 3. Docker 설치 및 Elasticsearch 실행
brew install --cask docker
open -a Docker
# Docker가 시작될 때까지 1분 대기

docker run -d --name elasticsearch -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# 4. 프로젝트로 이동
cd "/Users/hy/git/Elasticsearch Management Tool/new"

# 5. 의존성 설치
npm install

# 6. 개발 서버 실행
npm run dev

# 7. 브라우저에서 http://localhost:3000 열기
```

---

## 🆕 Next.js 15의 새로운 기능

이 프로젝트는 최신 Next.js 15를 사용합니다:

### 주요 변경사항:

1. **React 19 지원**
   - 최신 React Hooks
   - 향상된 성능
   - 더 나은 타입 지원

2. **Turbopack Dev (안정화)**
   - `npm run dev --turbo`
   - 최대 96% 빠른 Hot Module Replacement
   - 최대 76% 빠른 서버 시작

3. **향상된 캐싱**
   - GET 라우트는 기본적으로 캐시되지 않음
   - 더 예측 가능한 동작

4. **비동기 Request APIs**
   - `cookies()`, `headers()` 등이 이제 async
   - 자동 마이그레이션 codemod 제공

---

## 📊 시스템 요구사항

### 최소 사양:
- **macOS**: 11 (Big Sur) 이상
- **Node.js**: 18.18 이상
- **RAM**: 4GB
- **디스크**: 2GB 여유 공간

### 권장 사양:
- **macOS**: 14 (Sonoma) 이상
- **Node.js**: 20.x LTS
- **RAM**: 8GB 이상
- **디스크**: 5GB 여유 공간
- **CPU**: Apple Silicon (M1/M2/M3) 또는 Intel i5 이상

---

## 🔄 업데이트 및 유지보수

```bash
# 의존성 업데이트 확인
npm outdated

# Next.js 최신 버전으로 업데이트
npm install next@latest

# 모든 패키지 업데이트 (주의!)
npm update

# 보안 취약점 확인
npm audit

# 보안 취약점 자동 수정
npm audit fix
```

---

## 💡 개발 팁

### VSCode 사용자

```bash
# VSCode로 프로젝트 열기
code .
```

**추천 확장 프로그램:**
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- TypeScript Vue Plugin (Volar)

### 유용한 명령어

```bash
# Turbopack으로 더 빠른 개발
npm run dev --turbo

# 특정 포트로 실행
PORT=3001 npm run dev

# 타입 체크만 실행
npx tsc --noEmit

# ESLint 실행
npm run lint

# 프로덕션 빌드 분석
npm run build -- --profile
```

---

## 📚 추가 학습 자료

- [Next.js 15 공식 문서](https://nextjs.org/docs)
- [React 19 업그레이드 가이드](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

## 🆘 도움이 필요하신가요?

문제가 계속되면:

1. **로그 확인**: 터미널의 에러 메시지를 자세히 읽어보세요
2. **검색**: 에러 메시지로 구글 검색
3. **GitHub Issues**: 프로젝트 저장소에 이슈 등록
4. **커뮤니티**: Next.js Discord, Stack Overflow

---

**🎉 축하합니다! 이제 최신 Next.js 15 + React 19 기반의 Elasticsearch Management Tool을 사용할 수 있습니다!**
