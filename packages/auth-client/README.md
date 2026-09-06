# @coldsurfers/auth-client

Cross-environment TypeScript SDK for `coldsurf-auth-server`(`paul-rockstar/apps/coldsurf-auth-server`). Mirrors the v1·v2·user-identity surface and pluggable token storage (cookie · localStorage · `expo-secure-store` · memory).

## Why

paul-rockstar 의 `auth-microservice` 가 *백엔드* 인증을 단일 SSOT (`coldsurf-auth-server`) 로 모았지만 *클라이언트* 측은 각자 raw `fetch` — `coldsurf-studio` · `billets-app` · `billets-admin` 세 군데가 자체 호출 코드를 가짐. 본 SDK 는 그 짝패 — provider · storage · token refresh 의 *유일한 진실원*.

## Install

```bash
# .npmrc 가 @coldsurfers scope → GitHub Packages 로 설정되어 있어야 함.
pnpm add @coldsurfers/auth-client
```

발행본은 **빌드본(`dist`)** 이다 — 소비처가 `transpilePackages` 같은 설정을 질 필요가 없다.

## Quick start (Next.js / 브라우저)

```ts
import { AuthClient, CookieTokenStorage } from '@coldsurfers/auth-client';

const auth = new AuthClient({
  baseUrl: 'https://auth.coldsurf.io',
  storage: new CookieTokenStorage({
    attributes: {
      secure: true,                       // localhost http 면 false (아래 dev 가이드 참조)
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    },
  }),
});

// 1. Email — 6 자리 코드 → 확인 → 가입.
//    auth-server 의 email provider 는 confirmCode (소유 증명) + password (자격 증명)
//    둘 다 요구. 따라서 SDK signup 도 password 필수.
//    (`SignUpBodyDTO.password` 가 optional 인 이유: google/apple provider 는 token
//     으로 대신함. provider 별 분기는 SDK 의 EmailProvider/GoogleProvider/AppleProvider 가 강제.)
await auth.email.sendCode({ email });
await auth.email.confirmCode({ email, authCode });
const session = await auth.email.signup({ email, password });
await auth.session.persist(session.authToken);

// 2. 보호 라우트.
const me = await auth.user.me(); // 401 → /v2/auth/tokens/refresh 자동 재시도 1 회.
```

### dev 환경 — `secure` 끄기

`CookieTokenStorage` 기본값은 `secure: true`. 그대로 두면 `http://localhost` 에서는 *쿠키가 조용히 설정 안 됨* — 로컬 개발 중 로그인은 되지만 다음 요청에서 401 로 보임. 해결:

```ts
new CookieTokenStorage({
  attributes: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
});
```

### Next.js Route Handler — SSR cookie adapter

브라우저 외 컨텍스트(Route Handler, Server Action, middleware)는 `document.cookie` 가 없으므로 `adapter` 옵션으로 Next.js `cookies()` 를 주입:

```ts
import { cookies } from 'next/headers';
import { AuthClient, CookieTokenStorage, type CookieAdapter } from '@coldsurfers/auth-client';

function nextCookieAdapter(): CookieAdapter {
  const store = cookies();
  return {
    get: (name) => store.get(name)?.value ?? null,
    set: (name, value, attrs) => store.set(name, value, { ...attrs, httpOnly: attrs.httpOnly ?? true }),
    remove: (name, attrs) => store.set(name, '', { ...attrs, maxAge: 0 }),
  };
}

const auth = new AuthClient({
  baseUrl: process.env.AUTH_API_BASE_URL!,
  storage: new CookieTokenStorage({ adapter: nextCookieAdapter() }),
});
```

## React Native (`expo-secure-store`)

```ts
import * as SecureStore from 'expo-secure-store';
import { AuthClient, SecureStoreTokenStorage } from '@coldsurfers/auth-client';

const auth = new AuthClient({
  baseUrl: 'https://auth.coldsurf.io',
  storage: new SecureStoreTokenStorage({ secureStore: SecureStore }),
});
```

`expo-secure-store` 모듈을 *주입*. SDK 는 구조적 인터페이스만 보유 → RN 외 환경에서도 컴파일 통과.

## Google OAuth (server-side)

```ts
// 1. (브라우저) → redirect URL.
const url = auth.google.buildRedirectUrl({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  redirectUri: 'https://studio.coldsurf.io/api/auth/google-redirect',
});

// 2. (서버) callback 에서 code → id_token.
const { id_token } = await auth.google.exchangeCode({
  code,
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri,
});

// 3. id_token → auth-server 세션 발급.
const { authToken } = await auth.google.signin({ idToken: id_token, email, platform: 'web' });
await auth.session.persist(authToken);
```

## Apple Sign-In

`AppleAuthentication` (RN) · `AppleID.auth.signIn()` (web) 으로 받은 `identity_token` 을 그대로 SDK 로:

```ts
const { authToken } = await auth.apple.signin({ idToken, email, platform: 'ios' });
await auth.session.persist(authToken);
```

## API version

기본 `v2`. billets-app 의 일부 화면이 v1 잔존이면:

```ts
new AuthClient({ baseUrl, storage, apiVersion: 'v1' });
```

v1 ↔ v2 path 매핑은 [`src/paths.ts`](./src/paths.ts) 의 `PATHS` 상수. `/v2/auth/check` 는 v2 전용 — v1 에서 호출 시 `AuthError({ code: 'SDK_UNKNOWN' })`.

## Token refresh

- 보호 라우트(`auth: true`) 호출이 401 → storage 의 `refreshToken` 으로 자동 재시도.
- 동시 401 진입 시 *단일* refresh promise 공유 (`HttpClient.refreshInFlight`).
- 재시도 후 다시 401 또는 refresh 자체 실패 → storage clear + `AuthError({ code: 'SDK_UNAUTHORIZED' \| 'SDK_REFRESH_FAILED' })`.

## Storage adapters

| Adapter | 환경 | 비고 |
| --- | --- | --- |
| `MemoryTokenStorage` | 테스트·SSR-잠시 | 휘발성 |
| `CookieTokenStorage` | Next.js · 브라우저 | `document.cookie` 기본, SSR 컨텍스트는 `adapter` 옵션 주입 |
| `LocalStorageTokenStorage` | 브라우저 (fallback) | XSS 노출 — 명시적 선택만 |
| `SecureStoreTokenStorage` | React Native (Expo) | `expo-secure-store` 모듈 주입 |

## 범위 밖

- React hooks (`useAuth` 등) — 별 패키지 검토.
- Apple Sign-In 의 client-side 흐름 (RN/web SDK 호출) — consumer 책임.
- token 만료/회전 *주기* — auth-server 가 결정. SDK 는 storage 추상만.
