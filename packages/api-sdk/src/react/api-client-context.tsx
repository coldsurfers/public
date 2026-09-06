import { createContext } from 'react'
import type { ApiClientType } from '../types/api-client.types'

export type ApiClientContextType = {
  apiClient: ApiClientType
}

export const ApiClientContext = createContext<ApiClientContextType>({
  // biome-ignore lint/style/noNonNullAssertion: Provider 가 값을 넣기 전엔 소비할 수 없다 — 기본값 자리를 비워 두는 관례
  apiClient: null!,
})
