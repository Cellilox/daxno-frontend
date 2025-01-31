'use client'
import React from 'react'

export const PageProgressBar = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 overflow-hidden z-50">
    <div className="h-full w-full bg-blue-500 animate-progress-bar"></div>
  </div>
  )
}

export const ComponentProgressBar = () => {
    return (
        <div className="w-full h-1 bg-gray-200 overflow-hidden z-50">
        <div className="h-full w-full bg-blue-500 animate-progress-bar"></div>
      </div>
      )
}
