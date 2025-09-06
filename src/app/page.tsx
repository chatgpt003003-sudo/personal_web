import ProjectGrid from '@/components/ProjectGrid';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-red-600">Portfolio</h1>
        <nav className="flex space-x-6">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link href="/blog" className="hover:text-gray-300">
            Blog
          </Link>
          <a href="#about" className="hover:text-gray-300">
            About
          </a>
          <a href="#contact" className="hover:text-gray-300">
            Contact
          </a>
        </nav>
      </header>

      <main className="px-6 py-8">
        <section className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-gray-400 text-lg mb-8">
            Discover my latest work and creative endeavors
          </p>
        </section>

        <ProjectGrid />
      </main>
    </div>
  );
}
