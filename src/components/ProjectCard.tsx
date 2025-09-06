'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import VideoPlayer from './VideoPlayer'

interface Project {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  videoUrl: string | null
  metadata: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
}

interface ProjectCardProps {
  project: Project
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const metadata = project.metadata ? JSON.parse(project.metadata) : null

  return (
    <motion.div
      className="group relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {project.videoUrl ? (
        <VideoPlayer
          videoUrl={project.videoUrl}
          imageUrl={project.imageUrl || undefined}
          isHovered={isHovered}
          title={project.title}
        />
      ) : project.imageUrl && !imageError ? (
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">No Preview</p>
          </div>
        </div>
      )}
      
      <motion.div 
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.4 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent"
        initial={{ y: 8, opacity: 0.8 }}
        animate={{ y: isHovered ? 0 : 8, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-white font-semibold text-lg mb-1 truncate">{project.title}</h3>
        {project.description && (
          <p className="text-gray-300 text-sm line-clamp-2 mb-2">{project.description}</p>
        )}
        {metadata && (
          <div className="flex flex-wrap gap-1">
            {metadata.tags && metadata.tags.slice(0, 2).map((tag: string, index: number) => (
              <span key={index} className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
      
      <motion.div 
        className="absolute top-4 right-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isHovered ? 1 : 0, 
          scale: isHovered ? 1 : 0.8 
        }}
        transition={{ duration: 0.2 }}
      >
        <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  )
}

export default ProjectCard