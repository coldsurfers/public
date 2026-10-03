import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { note, noteHeadline, noteMetaTone } from './Note.css'

/**
 * 메타 줄의 색. 기본 `accent` — 노트의 메타 한 줄은 「accent 글자는 *누를 것*에만」 규율
 * (coldsurfers/paul-rockstar#452 Phase 2)이 처음부터 인정한 예외 자리다. 읽는 글로 쓰면 `muted`.
 */
export type NoteTone = 'accent' | 'muted'

export interface NoteProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 위 한 줄 — 시각·수치·출처처럼 헤드라인을 *놓을 자리*를 말한다. 없으면 안 그린다. */
  meta?: ReactNode
  /** 메타 줄의 색. 기본 `accent`. */
  tone?: NoteTone
  /** 아래 한 줄 — 이 카드가 말하려는 것. */
  children: ReactNode
}

/**
 * 알림 노트 한 장 — 메타 한 줄 + 헤드라인 한 줄.
 *
 * ```tsx
 * <Note meta="9월 20일 19:00">언니네 이발관 단독공연</Note>
 * <Note meta="어제 저장함" tone="muted">Slowdive 내한</Note>
 * ```
 *
 * **슬롯이 아니라 문자열 둘을 받는다.** 이건 배치가 아니라 *타이포 묶음*이라, `ReactNode` 를
 * 자유롭게 받으면 부르는 쪽이 매번 두 줄의 크기·무게를 다시 정하게 된다 — 그럼 이 컴포넌트가
 * 막으려던 드리프트가 그대로 돌아온다. (`ReactNode` 인 건 링크·시간 태그를 감쌀 수 있게 하기
 * 위해서지, 다른 서식을 넣으라는 뜻이 아니다.)
 *
 * 여러 장을 세로로 쌓는 패널은 여기 없다 — 배경이 `gradient.panel` 이든 `surface2` 든 호출자가
 * 정하는 축이고, 그 껍데기는 `<div>` 한 겹이라 추출할 중복이 없다(`layout/index.ts` 의 같은 판정).
 */
export function Note({ meta, tone = 'accent', className, children, ...rest }: NoteProps) {
  return (
    <div className={cx(note, className)} {...rest}>
      {meta ? <span className={noteMetaTone[tone]}>{meta}</span> : null}
      <span className={noteHeadline}>{children}</span>
    </div>
  )
}
