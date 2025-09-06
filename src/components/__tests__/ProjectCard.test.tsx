import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectCard from '../ProjectCard';

// Mock VideoPlayer component
jest.mock('../VideoPlayer', () => {
  return function MockVideoPlayer({
    title,
    isHovered,
  }: {
    title: string;
    isHovered: boolean;
  }) {
    return (
      <div data-testid="video-player" data-hovered={isHovered}>
        {title}
      </div>
    );
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    onError,
  }: {
    src: string;
    alt: string;
    onError: () => void;
  }) {
    return (
      <img src={src} alt={alt} data-testid="project-image" onError={onError} />
    );
  };
});

const mockProject = {
  id: '1',
  title: 'Test Project',
  description: 'A test project description',
  imageUrl: 'https://example.com/image.jpg',
  videoUrl: null,
  metadata: JSON.stringify({
    tags: ['React', 'TypeScript', 'Testing'],
  }),
  published: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

describe('ProjectCard', () => {
  it('renders project title and description', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project description')).toBeInTheDocument();
  });

  it('renders project with video when videoUrl is provided', () => {
    const projectWithVideo = {
      ...mockProject,
      videoUrl: 'https://example.com/video.mp4',
    };
    render(<ProjectCard project={projectWithVideo} />);

    expect(screen.getByTestId('video-player')).toBeInTheDocument();
  });

  it('renders project image when only imageUrl is provided', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByTestId('project-image')).toBeInTheDocument();
    expect(screen.getByTestId('project-image')).toHaveAttribute(
      'src',
      mockProject.imageUrl
    );
  });

  it('renders fallback UI when no image or video is available', () => {
    const projectWithoutMedia = {
      ...mockProject,
      imageUrl: null,
      videoUrl: null,
    };
    render(<ProjectCard project={projectWithoutMedia} />);

    expect(screen.getByText('No Preview')).toBeInTheDocument();
  });

  it('renders tags from metadata', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('limits tags to first 2 items', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.queryByText('Testing')).not.toBeInTheDocument();
  });

  it('handles hover state changes', () => {
    render(<ProjectCard project={mockProject} />);

    const card = screen.getByText('Test Project').closest('div');
    expect(card).toBeInTheDocument();

    // Test mouse enter
    if (card) {
      fireEvent.mouseEnter(card);
    }

    // Test mouse leave
    if (card) {
      fireEvent.mouseLeave(card);
    }
  });

  it('handles image error gracefully', () => {
    render(<ProjectCard project={mockProject} />);

    const image = screen.getByTestId('project-image');
    fireEvent.error(image);

    // After error, should show fallback UI
    expect(screen.getByText('No Preview')).toBeInTheDocument();
  });

  it('handles project without metadata', () => {
    const projectWithoutMetadata = {
      ...mockProject,
      metadata: null,
    };
    render(<ProjectCard project={projectWithoutMetadata} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('handles project without description', () => {
    const projectWithoutDescription = {
      ...mockProject,
      description: null,
    };
    render(<ProjectCard project={projectWithoutDescription} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(
      screen.queryByText('A test project description')
    ).not.toBeInTheDocument();
  });
});
