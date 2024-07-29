'use client'

// Based on https://github.com/facebook/react/blob/a6b5ed01ae98a18507cb92d8e932a8ca321602e6/fixtures/concurrent/time-slicing/src/index.js

import { debounce, random, range } from 'lodash'
import {
  startTransition,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'

import Charts from './Charts'
import Clock from './Clock'

export default function App() {
  const [value, setValue] = useState('')
  const [strategy, setStrategy] = useState<'sync' | 'debounced' | 'async'>(
    'sync',
  )
  const [showDemo, setShowDemo] = useState(true)
  const [showClock, setShowClock] = useState(true)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === '?') {
        e.preventDefault()
        setShowClock((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const ignoreClickRef = useRef(false)
  const handleChartClick = (e: React.MouseEvent) => {
    if (showDemo) {
      if (e.shiftKey) {
        setShowDemo(false)
      }
      return
    }
    if (strategy !== 'async') {
      setShowDemo((prev) => !prev)
      return
    }
    if (ignoreClickRef.current) {
      return
    }
    ignoreClickRef.current = true

    startTransition(() => {
      setShowDemo(true)
    })
  }

  useEffect(() => {
    if (showDemo && ignoreClickRef.current) {
      ignoreClickRef.current = false
    }
  }, [showDemo])

  const debouncedHandleChange = debounce((value) => {
    if (strategy === 'debounced') {
      setValue(value)
    }
  }, 1000)

  const renderOption = (option, label) => {
    return (
      <label className={strategy === option ? 'selected' : null}>
        <input
          type="radio"
          checked={strategy === option}
          onChange={() => setStrategy(option)}
        />
        {label}
      </label>
    )
  }

  const [pending, setPending] = useTransition()
  const handleChange = (e) => {
    const value = e.target.value
    switch (strategy) {
      case 'sync':
        setValue(value)
        break
      case 'debounced':
        debouncedHandleChange(value)
        break
      case 'async':
        setPending(() => {
          setValue(value)
        })
        break
      default:
        break
    }
  }

  // Random data for the chart
  const multiplier = value.length !== 0 ? value.length : 1
  // const complexity =
  //   (parseInt(window.location.search.slice(1), 10) / 100) * 25 || 25
  const complexity = 25
  const data = range(5).map((t) =>
    range(complexity * multiplier).map((j) => {
      return {
        x: j,
        y: (t + 1) * random(0, 255),
      }
    }),
  )

  return (
    <div className="container">
      <div className="rendering">
        {renderOption('sync', 'Synchronous')}
        {renderOption('debounced', 'Debounced')}
        {renderOption('async', 'Concurrent')}
      </div>
      <input
        className={`input ${strategy}`}
        placeholder="longer input → more components and DOM nodes"
        defaultValue={value}
        onChange={handleChange}
      />
      <div className="demo" onClick={handleChartClick}>
        {showDemo && <Charts data={data} pending={pending} />}
        <div style={{ display: showClock ? 'block' : 'none' }}>
          <Clock />
        </div>
      </div>
    </div>
  )
}
