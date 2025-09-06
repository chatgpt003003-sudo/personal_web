/**
 * @jest-environment node
 */

import { GET, POST } from '../projects/route';
import { NextRequest } from 'next/server';

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock console.error to avoid noise in tests
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

const mockProjects = [
  {
    id: '1',
    title: 'Test Project 1',
    description: 'Description 1',
    imageUrl: 'https://example.com/image1.jpg',
    videoUrl: null,
    metadata: '{"tags": ["react"]}',
    published: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    title: 'Test Project 2',
    description: 'Description 2',
    imageUrl: 'https://example.com/image2.jpg',
    videoUrl: 'https://example.com/video2.mp4',
    metadata: '{"tags": ["nextjs"]}',
    published: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
];

describe('/api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('GET', () => {
    it('returns published projects successfully', async () => {
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const response = await GET();
      const data = await response.json();

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(response.status).toBe(200);
      expect(data).toEqual(mockProjects);
    });

    it('handles database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (prisma.project.findMany as jest.Mock).mockRejectedValue(error);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch projects' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error fetching projects:',
        error
      );
    });
  });

  describe('POST', () => {
    it('creates a new project successfully', async () => {
      const newProject = {
        id: '3',
        title: 'New Project',
        description: 'New Description',
        imageUrl: 'https://example.com/new-image.jpg',
        videoUrl: 'https://example.com/new-video.mp4',
        metadata: '{"tags": ["typescript"]}',
        published: true,
        createdAt: new Date('2023-01-03'),
        updatedAt: new Date('2023-01-03'),
      };

      const requestBody = {
        title: 'New Project',
        description: 'New Description',
        imageUrl: 'https://example.com/new-image.jpg',
        videoUrl: 'https://example.com/new-video.mp4',
        metadata: { tags: ['typescript'] },
        published: true,
      };

      (prisma.project.create as jest.Mock).mockResolvedValue(newProject);

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          title: 'New Project',
          description: 'New Description',
          imageUrl: 'https://example.com/new-image.jpg',
          videoUrl: 'https://example.com/new-video.mp4',
          metadata: JSON.stringify({ tags: ['typescript'] }),
          published: true,
        },
      });
      expect(response.status).toBe(201);
      expect(data).toEqual(newProject);
    });

    it('creates project with default published false when not specified', async () => {
      const newProject = {
        id: '4',
        title: 'Draft Project',
        description: 'Draft Description',
        imageUrl: null,
        videoUrl: null,
        metadata: null,
        published: false,
        createdAt: new Date('2023-01-04'),
        updatedAt: new Date('2023-01-04'),
      };

      const requestBody = {
        title: 'Draft Project',
        description: 'Draft Description',
      };

      (prisma.project.create as jest.Mock).mockResolvedValue(newProject);

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          title: 'Draft Project',
          description: 'Draft Description',
          imageUrl: undefined,
          videoUrl: undefined,
          metadata: null,
          published: false,
        },
      });
      expect(response.status).toBe(201);
      expect(data).toEqual(newProject);
    });

    it('handles metadata serialization properly', async () => {
      const newProject = {
        id: '5',
        title: 'Project with metadata',
        description: 'Description',
        imageUrl: null,
        videoUrl: null,
        metadata: '{"tags": ["react", "nextjs"], "duration": "3 months"}',
        published: false,
        createdAt: new Date('2023-01-05'),
        updatedAt: new Date('2023-01-05'),
      };

      const requestBody = {
        title: 'Project with metadata',
        description: 'Description',
        metadata: { tags: ['react', 'nextjs'], duration: '3 months' },
      };

      (prisma.project.create as jest.Mock).mockResolvedValue(newProject);

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          title: 'Project with metadata',
          description: 'Description',
          imageUrl: undefined,
          videoUrl: undefined,
          metadata: JSON.stringify({
            tags: ['react', 'nextjs'],
            duration: '3 months',
          }),
          published: false,
        },
      });
      expect(response.status).toBe(201);
    });

    it('handles database errors during creation', async () => {
      const error = new Error('Database constraint violation');
      (prisma.project.create as jest.Mock).mockRejectedValue(error);

      const requestBody = {
        title: 'Failing Project',
        description: 'This will fail',
      };

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create project' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error creating project:',
        error
      );
    });

    it('handles malformed JSON request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create project' });
    });
  });
});
