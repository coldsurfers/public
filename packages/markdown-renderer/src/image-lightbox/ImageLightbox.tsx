import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import * as s from './ImageLightbox.css'

interface ImageLightboxProps {
  src: string
  alt?: string
  className?: string
}

// 마크다운 이미지를 클릭하면 fullscreen 모달로 확대.
// 단순 fade+scale 트랜지션 (framer-motion 의 layoutId magic-move 는 두 요소가
// 동일 layoutId 로 동시에 mount 될 때 정지하는 케이스가 있어 회피).
//
// AnimatePresence 는 portal 안쪽에 둔다 — 바깥에 두면 portal 아래의 motion
// 자식을 추적하지 못해 mount/exit 가 정상 동작하지 않는다.
export function ImageLightbox({ src, alt, className }: ImageLightboxProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={alt ?? 'Image preview'}
          className={s.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={() => setOpen(false)}
        >
          <motion.img
            src={src}
            alt={alt}
            className={s.image}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
          <button
            type="button"
            aria-label="Close image preview"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
            className={s.closeButton}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 4L16 16M16 4L4 16" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ cursor: 'zoom-in' }}
        onClick={() => setOpen(true)}
      />
      {mounted && createPortal(modal, document.body)}
    </>
  )
}
