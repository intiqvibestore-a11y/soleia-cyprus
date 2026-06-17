import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const dot  = useRef(null)
  const ring = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only activate on pointer (non-touch) devices
    if (!window.matchMedia('(pointer: fine)').matches) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX  = mouseX
    let ringY  = mouseY
    let rafId  = null
    let isHover  = false
    let isHidden = false

    const move = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Position dot instantly
      if (dot.current) {
        dot.current.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`
      }

      // Detect hover over interactive elements
      const el = e.target.closest(
        'a, button, [role="button"], label, select, input[type="range"], ' +
        'input[type="checkbox"], input[type="radio"], [data-cursor-hover]'
      )
      const nowHover = !!el
      if (nowHover !== isHover) {
        isHover = nowHover
        dot.current?.classList.toggle('is-hover', isHover)
        ring.current?.classList.toggle('is-hover', isHover)
      }

      if (!visible) setVisible(true)
    }

    const leave = () => {
      isHidden = true
      dot.current?.classList.add('is-hidden')
      ring.current?.classList.add('is-hidden')
    }
    const enter = () => {
      isHidden = false
      dot.current?.classList.remove('is-hidden')
      ring.current?.classList.remove('is-hidden')
    }

    // Animate ring with lerp lag
    const animate = () => {
      ringX += (mouseX - ringX) * 0.13
      ringY += (mouseY - ringY) * 0.13
      if (ring.current) {
        ring.current.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`
      }
      rafId = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', leave)
    document.addEventListener('mouseenter', enter)
    rafId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
      document.removeEventListener('mouseenter', enter)
      cancelAnimationFrame(rafId)
    }
  }, [])

  if (!window.matchMedia?.('(pointer: fine)').matches) return null

  return (
    <>
      <div ref={dot}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
