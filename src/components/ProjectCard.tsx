'use client'

import { useState } from 'react'
import Image from 'next/image'

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
    <div
      className="group relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {project.imageUrl && !imageError ? (
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
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300" />
      
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent transform transition-transform duration-300 ${
        isHovered ? 'translate-y-0' : 'translate-y-2'
      }`}>
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
      </div>
      
      {isHovered && (
        <div className="absolute top-4 right-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 transition-all duration-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProjectCard