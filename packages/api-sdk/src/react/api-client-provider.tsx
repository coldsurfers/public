import { type PropsWithChildren, useContext, useMemo } from 'react'
import { ApiClientContext, type ApiClientContextType } from './api-client-context'

export const ApiClientProvider = ({
  apiClient,
  children,
}: PropsWithChildren<ApiClientContextType>) => {
  const value = useMemo(
    () => ({
      apiClient,
    }),
    [apiClient],
  )
  return <ApiClientContext.Provider value={value}>{children}</ApiClientContext.Provider>
}

export const useApiClientContext = () => useContext(ApiClientContext)
