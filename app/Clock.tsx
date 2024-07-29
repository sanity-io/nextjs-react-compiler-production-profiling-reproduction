import { useEffect, useRef } from 'react'

const SPEED = 0.003 / Math.PI
const FRAMES = 10

export default function Clock() {
  const faceRef = useRef<SVGCircleElement | null>(null)
  const arcGroupRef = useRef<SVGGElement | null>(null)
  const clockHandRef = useRef<SVGPathElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const hitCounterRef = useRef(0)
  const rotationRef = useRef(0)
  const t0Ref = useRef(Date.now())
  const arcsRef = useRef<{ rotation: number; td: number }[]>([])

  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const td = now - t0Ref.current
      rotationRef.current = (rotationRef.current + SPEED * td) % (2 * Math.PI)
      t0Ref.current = now

      arcsRef.current.push({ rotation: rotationRef.current, td })

      let lx, ly, tx, ty
      if (arcsRef.current.length > FRAMES) {
        arcsRef.current.forEach(({ rotation, td }, i) => {
          lx = tx
          ly = ty
          const r = 145
          tx = 155 + r * Math.cos(rotation)
          ty = 155 + r * Math.sin(rotation)
          const bigArc = SPEED * td < Math.PI ? '0' : '1'
          const path = `M${tx} ${ty}A${r} ${r} 0 ${bigArc} 0 ${lx} ${ly}L155 155`
          const hue = 120 - Math.min(120, td / 4)
          const colour = `hsl(${hue}, 100%, ${60 - i * (30 / FRAMES)}%)`
          if (i !== 0) {
            const arcEl = arcGroupRef.current.children[i - 1]
            arcEl.setAttribute('d', path)
            arcEl.setAttribute('fill', colour)
          }
        })
        clockHandRef.current.setAttribute('d', `M155 155L${tx} ${ty}`)
        arcsRef.current.shift()
      }

      if (hitCounterRef.current > 0) {
        faceRef.current.setAttribute(
          'fill',
          `hsla(0, 0%, ${hitCounterRef.current}%, 0.95)`,
        )
        hitCounterRef.current -= 1
      } else {
        hitCounterRef.current = 0
        faceRef.current.setAttribute('fill', 'hsla(0, 0%, 5%, 0.95)')
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (e: any) => {
    e.stopPropagation()
    hitCounterRef.current = 50
  }

  useEffect(() => {
    if (faceRef.current) {
      const faceElement = faceRef.current
      faceElement.addEventListener('click', handleClick)
      return () => {
        faceElement.removeEventListener('click', handleClick)
      }
    }
  }, [])

  const paths = new Array(FRAMES)
  for (let i = 0; i < FRAMES; i++) {
    paths.push(<path className="arcHand" key={i} />)
  }
  return (
    <div className="stutterer">
      <svg height="310" width="310">
        <circle
          className="clockFace"
          onClick={handleClick}
          cx={155}
          cy={155}
          r={150}
          ref={faceRef}
        />
        <g ref={arcGroupRef}>{paths}</g>
        <path className="clockHand" ref={clockHandRef} />
      </svg>
    </div>
  )
}
