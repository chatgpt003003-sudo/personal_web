import { prisma } from './prisma'

const sampleProjects = [
  {
    title: "E-Commerce Platform",
    description: "Modern e-commerce solution with React and Node.js",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop",
    metadata: JSON.stringify({
      tags: ["React", "Node.js", "MongoDB"],
      duration: "3 months",
      client: "TechCorp"
    }),
    published: true
  },
  {
    title: "Mobile Banking App",
    description: "Secure mobile banking application with biometric authentication",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop",
    metadata: JSON.stringify({
      tags: ["React Native", "TypeScript", "Security"],
      duration: "6 months",
      client: "FinanceBank"
    }),
    published: true
  },
  {
    title: "AI Dashboard",
    description: "Analytics dashboard powered by machine learning insights",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    metadata: JSON.stringify({
      tags: ["Python", "AI", "React"],
      duration: "4 months",
      client: "DataCorp"
    }),
    published: true
  },
  {
    title: "Social Media Platform",
    description: "Next-generation social networking platform with real-time features",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop",
    metadata: JSON.stringify({
      tags: ["Next.js", "Socket.io", "PostgreSQL"],
      duration: "8 months",
      client: "Social Inc"
    }),
    published: true
  },
  {
    title: "Healthcare Management",
    description: "Comprehensive healthcare management system for hospitals",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=450&fit=crop",
    metadata: JSON.stringify({
      tags: ["Vue.js", "Laravel", "MySQL"],
      duration: "12 months",
      client: "HealthSystem"
    }),
    published: true
  },
  {
    title: "Crypto Trading Bot",
    description: "Automated cryptocurrency trading bot with advanced algorithms",
    imageUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop",
    metadata: JSON.stringify({
      tags: ["Python", "Trading", "Algorithms"],
      duration: "2 months",
      client: "CryptoFund"
    }),
    published: true
  }
]

export async function seedDatabase() {
  try {
    console.log('Seeding database with sample projects...')
    
    for (const projectData of sampleProjects) {
      await prisma.project.create({
        data: projectData
      })
    }
    
    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}