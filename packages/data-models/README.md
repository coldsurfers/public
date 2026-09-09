# @coldsurfers/data-models

COLDSURF 서비스들이 주고받는 **와이어 계약** — zod 스키마와 그 `z.infer` 타입.

```bash
pnpm add @coldsurfers/data-models zod
```

```ts
import { ConcertDTOSchema, type ConcertDTO, FeedDefinitions } from '@coldsurfers/data-models'

const concert: ConcertDTO = ConcertDTOSchema.parse(await res.json())
```

## 진입점은 하나다

```ts
import { ... } from '@coldsurfers/data-models'
```

형제 패키지 `shared-utils` 는 루트 배럴을 버렸지만(`모듈 하나 = 진입점 하나`) 여기는 배럴을
남겼다. 그 규율의 근거 두 개가 여기선 성립하지 않는다 — 외부 의존이 `zod` 하나뿐이라 "안 쓰는
소비자가 지불한다"가 없고, DOM 을 무는 모듈이 없어 타입체크를 깰 일도 없다. 무엇보다 DTO 들이
서로를 참조하는 그래프라(`concert` → artist·poster·ticket·venue·location) 파일 경계가 공개 API
경계가 되지 못한다.

## zod 버전

`peerDependencies: { zod: ">=3.23.8" }`. zod 3·4 **둘 다** 받는다 — v4 전용 API(`z.strictObject` ·
`z.interface` · `.prefault()`)를 쓰지 않는다. `z.nativeEnum` · `.datetime()` 은 v4 에서
deprecated 지만 동작한다.

소비처와 zod 인스턴스가 갈리면 `instanceof` 판정이 깨진다. 소비 앱이 자기 zod 를 하나만 갖게 한다.

## 소비처

| 레포 | 워크스페이스 |
| --- | --- |
| `coldsurfers/paul-rockstar` | billets-server · coldsurf-auth-server · coldsurf-studio-server · web-next · personal-site · daily · db-migration · email-templates |
| `coldsurfers/surfers-root` | wamuseum-server |

`@deprecated` 가 붙은 이름(`FeedEntityTypes.BLOG_ARTICLE` ·
`FeedDefinitions.NEW_BLOG_ARTICLE_RELEASE`)은 `surfers-root` 잔존 소비 + **DB 에 실재하는 row**
때문에 남아 있다. 자세한 사정은 그 선언의 주석.
