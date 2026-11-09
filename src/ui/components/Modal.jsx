import { useLayoutEffect, useRef } from 'react'
import './modal.css'

export function Modal({ children, className = '', labelledBy, onClose }) {
  const dialogRef = useRef(null)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      requestAnimationFrame(() => {
        if (
          document.activeElement !== document.body ||
          document.querySelector('dialog[open]')
        )
          return
        const heading = document.querySelector('main h1, h1')
        if (!heading) return
        if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1
        heading.focus({ preventScroll: true })
      })
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`.trim()}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault()
        onClose?.()
      }}
    >
      {children}
    </dialog>
  )
}
