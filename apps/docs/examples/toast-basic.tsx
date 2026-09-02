'use client'
import { Button, ToastProvider, useToast } from '@coldsurfers/design-system/primitives'

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
