import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

interface WordFlashProps {
  text: string
  title: React.ReactNode
  description: React.ReactNode
  className?: string
  wordDuration?: number
  isHovered: boolean
}

export function WordFlash({
  text,
  title,
  description,
  className,
  wordDuration = 100,
  isHovered
}: WordFlashProps) {
  const words = text.split(" ")
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [wordMounted, setWordMounted] = useState(false)
  const hasPlayedRef = useRef(false)

  useEffect(() => {
    if (isHovered && !isAnimating && !hasPlayedRef.current) {
      hasPlayedRef.current = true
      setIsAnimating(true)
      setCurrentWordIndex(0)
    }
    if (!isHovered) {
      hasPlayedRef.current = false
      setIsAnimating(false)
      setCurrentWordIndex(-1)
      setWordMounted(false)
    }
  }, [isHovered, isAnimating])

  // Progress through words only after word is mounted
  useEffect(() => {
    if (wordMounted && isAnimating && currentWordIndex >= 0 && currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        setWordMounted(false)
        setCurrentWordIndex(prev => prev + 1)
      }, wordDuration)
      return () => clearTimeout(timer)
    } else if (isAnimating && currentWordIndex >= words.length) {
      setIsAnimating(false)
      setCurrentWordIndex(-1)
      setHasCompleted(true)
    }
  }, [wordMounted, currentWordIndex, words.length, wordDuration, isAnimating])

  const showWords = isAnimating && currentWordIndex >= 0 && currentWordIndex < words.length

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {showWords ? (
          <motion.span
            key={currentWordIndex}
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.08, ease: "easeOut" }}
            onAnimationComplete={() => setWordMounted(true)}
            className="text-6xl tracking-wide leading-none uppercase scale-y-90 font-base block"
          >
            {words[currentWordIndex]}
          </motion.span>
        ) : (
          <motion.div
            key={hasCompleted ? "content-full" : "content-title"}
            initial={{ opacity: 0, filter: "blur(12px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            {title}
            {hasCompleted && description}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
