import { useSuspenseQuery } from '@tanstack/react-query'
import { useApiClientContext } from '../../react'

export function useFeedDetailQuery({ feedId }: { feedId: string }) {
  const { apiClient } = useApiClientContext()
  return useSuspenseQuery({
    queryKey: apiClient.feed.queryKeys.detail.byFeedId(feedId),
    queryFn: () => apiClient.feed.fetchFeedDetail({ feedId }),
  })
}
