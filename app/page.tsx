'use client'

// Based on https://github.com/facebook/react/blob/a6b5ed01ae98a18507cb92d8e932a8ca321602e6/fixtures/concurrent/time-slicing/src/index.js

import { random, range } from 'lodash'
import dynamic from 'next/dynamic'
import { useDeferredValue, useEffect, useState } from 'react'

import Clock from './Clock'

const Charts = dynamic(() => import('./Charts'), { ssr: false })

export default function App() {
  const [value, setValue] = useState('')
  const [strategy, setStrategy] = useState<'sync' | 'debounced' | 'async'>(
    'sync',
  )
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

  // Random data for the chart
  const multiplier = value.length !== 0 ? value.length : 1
  const data = range(5).map((t) =>
    range(25 * multiplier).map((j) => {
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
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="demo">
        {strategy === 'async' ? (
          <ConcurrentCharts data={data} />
        ) : strategy === 'debounced' ? (
          <DebouncedCharts data={data} />
        ) : (
          <Charts data={data} pending={false} />
        )}
        <div style={{ display: showClock ? 'block' : 'none' }}>
          <Clock />
        </div>
      </div>
    </div>
  )
}

function ConcurrentCharts(props: {
  data: {
    x: number
    y: number
  }[][]
}) {
  const data = useDeferredValue(props.data)
  const pending = props.data !== data
  return <Charts data={data} pending={pending} />
}

function DebouncedCharts(props: {
  data: {
    x: number
    y: number
  }[][]
}) {
  const [data, setData] = useState(props.data)
  const pending = props.data !== data

  useEffect(() => {
    const timeout = setTimeout(() => setData(props.data), 1000)
    return () => clearTimeout(timeout)
  }, [props.data])

  return <Charts data={data} pending={pending} />
}
