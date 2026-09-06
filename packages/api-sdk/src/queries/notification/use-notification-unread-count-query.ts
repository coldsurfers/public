import { useSuspenseQuery } from '@tanstack/react-query'
import { useApiClientContext } from '../../react'

export const useNotificationUnreadCountQuery = () => {
  const { apiClient } = useApiClientContext()
  return useSuspenseQuery({
    queryKey: apiClient.notification.queryKeys.unreadCount,
    queryFn: () => apiClient.notification.getUnreadCount(),
  })
}
