'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Project {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const filteredProjects = projects.filter(project => {
    if (filter === 'published') return project.published
    if (filter === 'draft') return !project.published
    return true
  })

  if (loading) {
    return <div className="text-center py-8">Loading projects...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-400 mt-2">Manage your portfolio projects</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
        >
          New Project
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
        {['all', 'published', 'draft'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 rounded text-sm capitalize transition-colors ${
              filter === tab
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab} ({tab === 'all' ? projects.length : 
                  tab === 'published' ? projects.filter(p => p.published).length :
                  projects.filter(p => !p.published).length})
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {filter === 'all' ? 'No projects found.' : `No ${filter} projects found.`}
          </p>
          <Link
            href="/admin/projects/new"
            className="text-red-400 hover:text-red-300 mt-2 inline-block"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <div className="aspect-video bg-gray-800 relative">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">No Image</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate flex-1">{project.title}</h3>
                  <span className={`ml-2 px-2 py-1 rounded text-xs flex-shrink-0 ${
                    project.published 
                      ? 'bg-green-600 text-green-100' 
                      : 'bg-yellow-600 text-yellow-100'
                  }`}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                {project.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                <div className="text-xs text-gray-500 mb-4">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                  {project.updatedAt !== project.createdAt && (
                    <span className="ml-2">
                      Updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-center py-2 px-3 rounded text-sm transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}