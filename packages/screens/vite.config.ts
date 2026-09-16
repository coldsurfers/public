import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드 — **소스가 아니라 `dist` 를 발행한다.**
 *
 * CSS 가 없다. 이 패키지는 RN 전용이고, `.css.ts` 가 들어오면 Metro 가 깨진다
 * (design-system 의 `native` 레인과 같은 이유).
 *
 * 진입점 둘을 여는 이유는 **Metro 가 tree-shaking 을 하지 않기** 때문이다. 배럴(`.`)을 열면
 * 이 패키지가 가진 것이 전부 딸려온다. 아끼려면 소비처가 `@coldsurfers/screens/AppScreen` 을
 * 직접 열어야 한다 — 근거는 `docs/native-lane-porting.md` 의 「소비 — 배럴이냐 서브패스냐」.
 * 배럴을 남기는 건 빼면 major 이기 때문이다(`exports` 맵이 API).
 *
 * `rollupTypes: true` — 엔트리당 d.ts 한 장으로 만다. 소스 트리를 그대로 내보내면
 * 확장자 없는 상대 경로가 남는데 `moduleResolution: nodenext` 소비처가 그걸 못 연다.
 * 게이트는 `check:exports`.
 */
export default defineConfig({
  plugins: [dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true })],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        AppScreen: 'src/AppScreen.tsx',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-native',
        'react-native-safe-area-context',
        '@emotion/native',
        '@emotion/react',
        /^@coldsurfers\/design-system/,
      ],
    },
  },
})
