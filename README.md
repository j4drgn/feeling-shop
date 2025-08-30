# Duck Chat Deals

Duck Chat Deals는 카카오 로그인을 통해 인증하고, ChatGPT API를 활용한 대화형 쇼핑 도우미 애플리케이션입니다.

## 기능

- 카카오 소셜 로그인
- 대화형 AI 챗봇 (덕키)
- 상품 추천 및 검색
- 채팅 기록 저장 및 관리
- 사용자 감정 분석 기반 응답

## 기술 스택

### 프론트엔드

- React
- React Router
- TailwindCSS
- Shadcn UI
- React Query

### 백엔드

- Spring Boot
- Spring Security
- JWT 인증
- JPA/Hibernate
- H2 Database (개발)
- PostgreSQL (프로덕션)

### API 연동

- OpenAI ChatGPT API
- 카카오 OAuth API

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- Java 17 이상
- OpenAI API 키
- 카카오 개발자 계정 및 애플리케이션 등록

### 설치 및 실행

#### 백엔드

```bash
cd api
export JAVA_HOME=/path/to/java17
./gradlew bootRun --args='--spring.profiles.active=dev'
```

#### 프론트엔드

```bash
cd duck-chat-deals
npm install
npm run dev
```

## 환경 변수 설정

### 백엔드 (.env 파일)

```
OPENAI_API_KEY=your-openai-api-key
JWT_SECRET=your-jwt-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

### 프론트엔드 (.env 파일)

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 주요 API 엔드포인트

### 인증 API

- `GET /api/auth/kakao` - 카카오 로그인 시작
- `POST /api/auth/kakao/callback` - 카카오 로그인 콜백 처리
- `POST /api/auth/refresh` - 액세스 토큰 갱신

### 채팅 API

- `POST /api/chatgpt/chat` - 단일 메시지 전송
- `POST /api/chatgpt/chat/session/{sessionId}` - 세션 기반 메시지 전송
- `POST /api/chat/sessions` - 채팅 세션 생성
- `GET /api/chat/sessions` - 채팅 세션 목록 조회

### 사용자 API

- `GET /api/users/me` - 현재 사용자 정보 조회

## 프로젝트 구조

### 프론트엔드

```
src/
├── api/                  # API 호출 모듈
├── components/           # 재사용 가능한 컴포넌트
├── context/              # 컨텍스트 (인증, 테마 등)
├── hooks/                # 커스텀 훅
├── screens/              # 화면 컴포넌트
├── lib/                  # 유틸리티 함수
└── types/                # 타입 정의
```

### 백엔드

```
src/main/java/com/duckchat/api/
├── config/               # 설정 클래스
├── controller/           # API 컨트롤러
├── dto/                  # 데이터 전송 객체
├── entity/               # 데이터베이스 엔티티
├── repository/           # 데이터 접근 계층
├── security/             # 보안 관련 클래스
└── service/              # 비즈니스 로직
```

## 라이센스

MIT
