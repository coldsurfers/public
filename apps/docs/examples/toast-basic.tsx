'use client'
import { Button, ToastProvider, useToast } from '@coldsurfers/surf-ui/primitives'

function Trigger() {
  const toast = useToast()

  return (
    <>
      <Button onClick={() => toast.show('저장했습니다')}>기본</Button>
      <Button variant="outline" onClick={() => toast.show('저장했습니다', 'success')}>
        success
      </Button>
      <Button variant="outline" onClick={() => toast.show('저장하지 못했습니다', 'error')}>
        error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.show('대학로를 내 동네로 정했습니다', 'success', {
            description: '설정에서 바꾸거나 해제할 수 있습니다.',
            action: { label: '홈으로', onPress: () => {} },
          })
        }
      >
        두 줄 + 액션
      </Button>
    </>
  )
}

export default function Example() {
  return (
    <ToastProvider>
      <Trigger />
    </ToastProvider>
  )
}
