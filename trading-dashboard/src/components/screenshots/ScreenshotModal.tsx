import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Screenshot } from '../../types';
import { Dialog, DialogContent } from '../ui/dialog';

interface ScreenshotModalProps {
  screenshots: Screenshot[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({
  screenshots,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const currentScreenshot = screenshots[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < screenshots.length - 1;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && hasPrevious) {
        onNavigate(currentIndex - 1);
      } else if (event.key === 'ArrowRight' && hasNext) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasPrevious, hasNext, onClose, onNavigate]);

  // Navigate to previous screenshot
  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(currentIndex - 1);
    }
  };

  // Navigate to next screenshot
  const handleNext = () => {
    if (hasNext) {
      onNavigate(currentIndex + 1);
    }
  };

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentScreenshot.originalUrl;
    link.download = currentScreenshot.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 overflow-hidden bg-black/95 border-gray-800">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-medium truncate max-w-md">
              {currentScreenshot.fileName}
            </h3>
            <span className="text-gray-400 text-sm">
              {currentIndex + 1} / {screenshots.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Download button */}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Download screenshot"
            >
              <Download className="w-5 h-5 text-white" />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div className="relative w-full h-full flex items-center justify-center p-4 pt-20 pb-20">
          <img
            src={currentScreenshot.originalUrl}
            alt={currentScreenshot.fileName}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Navigation buttons */}
        {screenshots.length > 1 && (
          <>
            {/* Previous button */}
            {hasPrevious && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Next button */}
            {hasNext && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                aria-label="Next screenshot"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </>
        )}

        {/* Footer with thumbnails */}
        {screenshots.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-center gap-2 overflow-x-auto">
              {screenshots.map((screenshot, index) => (
                <button
                  key={screenshot.id}
                  onClick={() => onNavigate(index)}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                    ${
                      index === currentIndex
                        ? 'border-blue-500 ring-2 ring-blue-500/50'
                        : 'border-transparent hover:border-gray-500'
                    }
                  `}
                >
                  <img
                    src={screenshot.thumbnailUrl}
                    alt={screenshot.fileName}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard hints */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 text-xs text-gray-400">
          {hasPrevious && (
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-black/50 rounded">←</kbd> Previous
            </span>
          )}
          {hasNext && (
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-black/50 rounded">→</kbd> Next
            </span>
          )}
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-black/50 rounded">ESC</kbd> Close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
