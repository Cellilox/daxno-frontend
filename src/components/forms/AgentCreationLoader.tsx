'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Check, Loader2 } from 'lucide-react'

interface Step {
  label: string
  duration: number
}

const STEPS: Step[] = [
  { label: 'Creating your agent', duration: 1000 },
  { label: 'Setting up knowledge base', duration: 1300 },
  { label: 'Preparing your workspace', duration: 1400 },
  { label: 'Ready to go!', duration: 1000 },
]

interface AgentCreationLoaderProps {
  agentName: string
  onAnimationDone: () => void
}

export default function AgentCreationLoader({
  agentName,
  onAnimationDone,
}: AgentCreationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      const finalHold = setTimeout(onAnimationDone, 300)
      return () => clearTimeout(finalHold)
    }
    const timer = setTimeout(
      () => setCurrentStep((s) => s + 1),
      STEPS[currentStep].duration
    )
    return () => clearTimeout(timer)
  }, [currentStep, onAnimationDone])

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-md w-full">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-100"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Bot size={40} />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preparing your{' '}
          <span className="text-blue-600">{agentName}</span> agent
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Setting things up just for you…
        </p>
        <ul className="w-full max-w-xs space-y-3">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStep
            const isActive = idx === currentStep
            return (
              <motion.li
                key={step.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-center gap-3 text-left"
              >
                <span className="w-6 h-6 flex items-center justify-center shrink-0">
                  <AnimatePresence mode="wait" initial={false}>
                    {isDone ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-green-600"
                      >
                        <Check size={20} strokeWidth={3} />
                      </motion.span>
                    ) : isActive ? (
                      <motion.span
                        key="spin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-blue-600"
                      >
                        <Loader2 size={20} className="animate-spin" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="dot"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-2 h-2 rounded-full bg-gray-300"
                      />
                    )}
                  </AnimatePresence>
                </span>
                <span
                  className={
                    isDone
                      ? 'text-gray-900 font-medium'
                      : isActive
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-400'
                  }
                >
                  {step.label}
                </span>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
