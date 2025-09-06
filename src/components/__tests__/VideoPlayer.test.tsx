import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from '../VideoPlayer';

// Mock HTMLMediaElement methods
const mockPlay = jest.fn();
const mockPause = jest.fn();

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: mockPlay,
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: mockPause,
});

Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
  writable: true,
  value: 0,
});

const defaultProps = {
  videoUrl: 'https://example.com/video.mp4',
  imageUrl: 'https://example.com/image.jpg',
  isHovered: false,
  title: 'Test Video',
};

describe('VideoPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
  });

  it('renders background image when provided', () => {
    render(<VideoPlayer {...defaultProps} />);

    const image = screen.getByAltText('Test Video');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows play icon when not hovered', () => {
    render(<VideoPlayer {...defaultProps} />);

    // Should show play icon in the static state
    const playIcon = document.querySelector('svg');
    expect(playIcon).toBeInTheDocument();
  });

  it('renders video element when hovered', () => {
    render(<VideoPlayer {...defaultProps} isHovered={true} />);

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
  });

  it('attempts to play video when hovered', async () => {
    const { rerender } = render(
      <VideoPlayer {...defaultProps} isHovered={false} />
    );

    // Change to hovered state
    rerender(<VideoPlayer {...defaultProps} isHovered={true} />);

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled();
    });
  });

  it('pauses video when not hovered', async () => {
    const { rerender } = render(
      <VideoPlayer {...defaultProps} isHovered={true} />
    );

    // Change to not hovered state
    rerender(<VideoPlayer {...defaultProps} isHovered={false} />);

    await waitFor(() => {
      expect(mockPause).toHaveBeenCalled();
    });
  });

  it('handles video play error gracefully', async () => {
    mockPlay.mockRejectedValue(new Error('Play failed'));

    const { rerender } = render(
      <VideoPlayer {...defaultProps} isHovered={false} />
    );

    // Change to hovered state, which should trigger play and error
    rerender(<VideoPlayer {...defaultProps} isHovered={true} />);

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled();
    });

    // Should fall back to image display
    const fallbackImage = screen.getByAltText('Test Video');
    expect(fallbackImage).toBeInTheDocument();
  });

  it('renders fallback when video URL is not provided', () => {
    render(<VideoPlayer {...defaultProps} videoUrl="" />);

    const fallbackImage = screen.getByAltText('Test Video');
    expect(fallbackImage).toBeInTheDocument();
  });

  it('renders fallback icon when no video URL or image URL', () => {
    render(<VideoPlayer {...defaultProps} videoUrl="" imageUrl={undefined} />);

    // Should show the video icon fallback
    const videoIcon = document.querySelector('svg');
    expect(videoIcon).toBeInTheDocument();
  });

  it('handles video loading states', () => {
    render(<VideoPlayer {...defaultProps} isHovered={true} />);

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();

    // Simulate loading start
    if (video) {
      fireEvent.loadStart(video);
    }

    // Should show loading indicator
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();

    // Simulate can play
    if (video) {
      fireEvent.canPlay(video);
    }
  });

  it('handles video error event', () => {
    render(<VideoPlayer {...defaultProps} isHovered={true} />);

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();

    // Simulate video error
    if (video) {
      fireEvent.error(video);
    }

    // Should fall back to image display
    const fallbackImage = screen.getByAltText('Test Video');
    expect(fallbackImage).toBeInTheDocument();
  });

  it('resets video time to 0 when starting to play', async () => {
    const { rerender } = render(
      <VideoPlayer {...defaultProps} isHovered={false} />
    );

    // Change to hovered state
    rerender(<VideoPlayer {...defaultProps} isHovered={true} />);

    const video = document.querySelector('video') as HTMLVideoElement;

    await waitFor(() => {
      expect(video?.currentTime).toBe(0);
    });
  });
});
