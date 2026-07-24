import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import SplashCursor from '@/components/SplashCursor'
import track from '../astrothunder.mp3'

export default function App() {
  const [label, setLabel] = useState<'brand' | 'soon'>('brand')
  const [busy, setBusy] = useState(false)
  const armed = useRef(true)

  useEffect(() => {
    const audio = new Audio(track)
    audio.preload = 'auto'

    const onClick = () => {
      void audio.play()
    }

    window.addEventListener('pointerdown', onClick, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onClick)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [])

  const swap = () => {
    if (!armed.current || busy) return
    armed.current = false
    setBusy(true)
    setLabel((prev) => (prev === 'brand' ? 'soon' : 'brand'))
  }

  return (
    <div className="relative flex size-full min-h-dvh items-center justify-center">
      <SplashCursor
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={1440}
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={50}
      />
      <div
        className="relative z-[60] flex h-28 w-full items-center justify-center md:h-36"
        onMouseLeave={() => {
          armed.current = true
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {label === 'brand' ? (
            <motion.h1
              key="brand"
              className="text-5xl font-medium tracking-tight text-white md:text-7xl"
              variants={{ show: { opacity: 1 }, hide: { opacity: 0 } }}
              initial="hide"
              animate="show"
              exit="hide"
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              onAnimationComplete={(def) => {
                if (def === 'show') setBusy(false)
              }}
              onMouseEnter={swap}
            >
              horsse.club
            </motion.h1>
          ) : (
            <motion.p
              key="soon"
              className="absolute top-[68%] text-xl font-medium tracking-tight text-white md:text-2xl"
              variants={{ show: { opacity: 1 }, hide: { opacity: 0 } }}
              initial="hide"
              animate="show"
              exit="hide"
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              onAnimationComplete={(def) => {
                if (def === 'show') setBusy(false)
              }}
              onMouseEnter={swap}
            >
              coming soon
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
