import React, { useEffect, useState } from 'react';
import { Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchTradeScreenshots,
  deleteScreenshot,
  selectScreenshots,
  selectIsLoading,
  selectError,
} from '../../store/screenshotSlice';
import { Screenshot } from '../../types';
import { ScreenshotModal } from './ScreenshotModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface ScreenshotGalleryProps {
  tradeId?: string;
  mt5TradeId?: string;
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({
  tradeId,
  mt5TradeId,
}) => {
  const dispatch = useAppDispatch();
  const screenshots = useAppSelector(selectScreenshots);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [screenshotToDelete, setScreenshotToDelete] = useState<Screenshot | null>(null);

  // Fetch screenshots on mount (only if we have a trade ID)
  useEffect(() => {
    if (tradeId || mt5TradeId) {
      dispatch(fetchTradeScreenshots({ tradeId, mt5TradeId }));
    }
  }, [dispatch, tradeId, mt5TradeId]);

  // Handle delete confirmation
  const handleDeleteClick = (screenshot: Screenshot, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening modal
    setScreenshotToDelete(screenshot);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (screenshotToDelete) {
      await dispatch(deleteScreenshot(screenshotToDelete.id));
      setDeleteDialogOpen(false);
      setScreenshotToDelete(null);
    }
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedIndex(null);
  };

  // Handle navigation in modal
  const handleNavigate = (newIndex: number) => {
    setSelectedIndex(newIndex);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  // Empty state
  if (screenshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
          No Screenshots Yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload screenshots to document this trade
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Screenshots ({screenshots.length})
        </h4>

        {/* Grid of thumbnails */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {screenshots.map((screenshot, index) => (
            <div
              key={screenshot.id}
              className="relative group cursor-pointer"
              onClick={() => handleThumbnailClick(index)}
            >
              {/* Thumbnail */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <img
                  src={screenshot.thumbnailUrl}
                  alt={screenshot.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Delete button - shown on hover */}
              <button
                onClick={(e) => handleDeleteClick(screenshot, e)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete screenshot"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full-size view */}
      {selectedIndex !== null && (
        <ScreenshotModal
          screenshots={screenshots}
          currentIndex={selectedIndex}
          onClose={handleModalClose}
          onNavigate={handleNavigate}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Screenshot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this screenshot? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
