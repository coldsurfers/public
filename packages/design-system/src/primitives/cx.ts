export type ClassValue = string | false | null | undefined

/** 최소 className 합성 — falsy 를 걸러 공백으로 잇는다. clsx 대체(외부 dep 없음). */
export const cx = (...parts: ClassValue[]): string => parts.filter(Boolean).join(' ')
