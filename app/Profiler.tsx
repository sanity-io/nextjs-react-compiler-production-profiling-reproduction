'use client'

import React from 'react'

/* eslint-disable @typescript-eslint/ban-ts-comment */
export default function Profiler({ children }: React.PropsWithChildren) {
  return (
    <React.Profiler
      id="root-layout"
      onRender={(...res) => {
        // @ts-expect-error
        window.profileResults = window.profileResults || []
        // @ts-expect-error
        window.profileResults.push(res)
      }}
    >
      {children}
    </React.Profiler>
  )
}
