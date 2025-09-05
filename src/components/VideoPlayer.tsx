'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VideoPlayerProps {
  videoUrl: string
  imageUrl?: string
  isHovered: boolean
  title: string
}

export default function VideoPlayer({ videoUrl, imageUrl, isHovered, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isHovered && !hasError) {
      video.currentTime = 0
      video.play().catch(() => setHasError(true))
    } else {
      video.pause()
    }
  }, [isHovered, hasError])

  if (hasError || !videoUrl) {
    return imageUrl ? (
      <img 
        src={imageUrl} 
        alt={title}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Background image for loading state */}
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      )}
      
      {/* Video overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <source src={videoUrl} type="video/mp4" />
          </motion.video>
        )}
      </AnimatePresence>
      
      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && isHovered && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Play icon indicator */}
      <AnimatePresence>
        {!isHovered && videoUrl && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-black bg-opacity-50 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}