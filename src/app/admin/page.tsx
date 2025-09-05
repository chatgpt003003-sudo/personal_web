'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  published: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        
        const published = data.filter((p: Project) => p.published).length
        setStats({
          total: data.length,
          published,
          drafts: data.length - published
        })
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Manage your portfolio projects</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300">Total Projects</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300">Published</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">{stats.published}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300">Drafts</h3>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.drafts}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/projects/new"
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
          >
            New Project
          </Link>
          <Link
            href="/admin/projects"
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors"
          >
            Manage Projects
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Projects</h2>
          <Link href="/admin/projects" className="text-red-400 hover:text-red-300">
            View All
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <p className="text-gray-400">No projects yet. Create your first project!</p>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div className="flex-1">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    project.published 
                      ? 'bg-green-600 text-green-100' 
                      : 'bg-yellow-600 text-yellow-100'
                  }`}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}