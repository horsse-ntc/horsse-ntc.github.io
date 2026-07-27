import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import SplashCursor from '@/components/SplashCursor'
import track from '../astrothunder.mp3'

type Screenshot = {
  id?: string
  url: string
  caption: string
  game: string
  year: number | string | null
}

type ScreenshotsPayload = {
  screenshots?: Screenshot[]
  urls?: string[]
}

const GALLERY_URL = 'https://steamcommunity.com/id/horsse/screenshots/'

function screenshotHref(shot: Screenshot) {
  return shot.id
    ? `https://steamcommunity.com/sharedfiles/filedetails/?id=${shot.id}`
    : GALLERY_URL
}

function normalizeScreenshots(data: ScreenshotsPayload | null): Screenshot[] {
  if (data?.screenshots?.length) {
    return data.screenshots.filter((s) => Boolean(s?.url))
  }
  return (data?.urls ?? [])
    .filter(Boolean)
    .map((url) => ({ url, caption: '', game: '', year: null }))
}

export default function App() {
  const [label, setLabel] = useState<'brand' | 'soon'>('brand')
  const [busy, setBusy] = useState(false)
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null)
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

  useEffect(() => {
    let cancelled = false

    void fetch('/steam-screenshots.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ScreenshotsPayload | null) => {
        if (cancelled) return
        const shots = normalizeScreenshots(data)
        if (shots.length === 0) return
        setScreenshot(shots[Math.floor(Math.random() * shots.length)] ?? null)
      })
      .catch(() => {})

    return () => {
      cancelled = true
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
      {screenshot ? (
        <motion.a
          href={screenshotHref(screenshot)}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-[8vh] left-[6vw] z-[70] flex w-[min(50vw,600px)] flex-col items-center gap-4 outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative flex w-full items-end justify-center">
            <span className="absolute bottom-0 left-0 max-w-[min(100%,22rem)] translate-y-1.5 truncate text-xs font-medium tracking-tight text-white/55 md:text-sm">
              {screenshot.game || '\u00a0'}
            </span>
            <span className="relative z-10 shrink-0 -translate-y-2.5 bg-transparent px-2 text-xl font-medium tracking-tight text-white md:text-2xl">
              featured screenshot
            </span>
            <span className="absolute bottom-0 right-0 translate-y-1.5 text-xs font-medium tracking-tight text-white/55 md:text-sm">
              {screenshot.year ?? '\u00a0'}
            </span>
          </div>
          <img
            src={screenshot.url}
            alt=""
            className="h-auto w-full max-h-[min(44vh,400px)] object-contain"
            loading="lazy"
            decoding="async"
          />
          {screenshot.caption ? (
            <span className="text-center text-xs font-medium tracking-tight text-white/55 md:text-sm">
              "{screenshot.caption}"
            </span>
          ) : null}
        </motion.a>
      ) : null}
    </div>
  )
}
