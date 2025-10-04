'use client';

/**
 * Media Viewer
 * View images, videos, and audio files from Finder
 */

import { useState, useEffect } from 'react';
import { getStateFromURL } from '../../../../app/lib/utils/stateUtils';
import type { FileOpenData } from '../../../OS/lib/fileOpener';
import type { FileSystemItem } from '../../../OS/types/filesystem';
import styles from './MediaViewer.module.css';

interface MediaViewerProps {
  windowId: string;
}

export default function MediaViewer({ windowId }: MediaViewerProps) {
  const [fileData, setFileData] = useState<FileOpenData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load file from URL state
  useEffect(() => {
    const data = getStateFromURL<FileOpenData>('media-viewer');
    if (data && data.file) {
      setFileData(data);
      // If we have siblings, find current file's index
      if (data.siblings && data.siblings.length > 0) {
        const index = data.siblings.findIndex(s => s.id === data.file.id);
        setCurrentIndex(index >= 0 ? index : 0);
      }
    }
  }, []);

  // Calculate derived values (always, even if no fileData)
  const currentFile = fileData?.siblings && fileData.siblings.length > 0
    ? fileData.siblings[currentIndex]
    : fileData?.file;

  const hasSiblings = fileData?.siblings && fileData.siblings.length > 1;
  const canGoPrevious = hasSiblings && currentIndex > 0;
  const canGoNext = hasSiblings && currentIndex < (fileData?.siblings?.length || 0) - 1;

  // Navigation
  const goToPrevious = () => {
    if (canGoPrevious) {
      setCurrentIndex(currentIndex - 1);
      setZoom(1); // Reset zoom on navigation
    }
  };

  const goToNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1);
      setZoom(1); // Reset zoom on navigation
    }
  };

  // Zoom controls
  const zoomIn = () => setZoom(Math.min(zoom + 0.25, 3));
  const zoomOut = () => setZoom(Math.max(zoom - 0.25, 0.5));
  const resetZoom = () => setZoom(1);

  // Download file
  const downloadFile = () => {
    if (currentFile && currentFile.url) {
      const link = document.createElement('a');
      link.href = currentFile.url;
      link.download = currentFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    // Don't set up keyboard handlers if no file is loaded
    if (!fileData || !currentFile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoPrevious) {
        goToPrevious();
      } else if (e.key === 'ArrowRight' && canGoNext) {
        goToNext();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        resetZoom();
      } else if (e.key === 'f') {
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, canGoPrevious, canGoNext, isFullscreen, zoom, fileData, currentFile]);

  // Early return AFTER all hooks
  if (!fileData || !fileData.file || !currentFile) {
    return (
      <div className={styles.emptyState}>
        <p>No file to display</p>
        <p className={styles.hint}>Open a media file from Finder</p>
      </div>
    );
  }

  // Debug logging
  console.log('MediaViewer rendering:', {
    file: currentFile,
    url: currentFile.url,
    type: currentFile.type
  });

  // Render media based on type
  const renderMedia = () => {
    switch (currentFile.type) {
      case 'image':
        return (
          <div className={styles.imageContainer} style={{ transform: `scale(${zoom})` }}>
            <img
              src={currentFile.url}
              alt={currentFile.name}
              className={styles.image}
              onError={(e) => {
                console.error('Image failed to load:', currentFile.url);
                console.error('Error event:', e);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', currentFile.url);
              }}
            />
          </div>
        );

      case 'video':
        return (
          <video
            key={currentFile.id}
            controls
            className={styles.video}
            src={currentFile.url}
            autoPlay
          >
            Your browser does not support video playback.
          </video>
        );

      case 'audio':
        return (
          <div className={styles.audioContainer}>
            <div className={styles.audioIcon}>🎵</div>
            <div className={styles.audioInfo}>
              <h3>{currentFile.name}</h3>
              <p>{currentFile.extension?.toUpperCase()} Audio File</p>
            </div>
            <audio
              key={currentFile.id}
              controls
              className={styles.audio}
              src={currentFile.url}
              autoPlay
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        );

      default:
        return <div className={styles.unsupported}>Unsupported file type</div>;
    }
  };

  return (
    <div className={`${styles.mediaViewer} ${isFullscreen ? styles.fullscreen : ''}`}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* File info */}
        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{currentFile.name}</span>
          {hasSiblings && (
            <span className={styles.fileCount}>
              {currentIndex + 1} of {fileData.siblings?.length}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Navigation buttons */}
          {hasSiblings && (
            <div className={styles.navButtons}>
              <button
                className={styles.toolbarButton}
                onClick={goToPrevious}
                disabled={!canGoPrevious}
                title="Previous (←)"
              >
                ◀
              </button>
              <button
                className={styles.toolbarButton}
                onClick={goToNext}
                disabled={!canGoNext}
                title="Next (→)"
              >
                ▶
              </button>
            </div>
          )}

          {/* Zoom controls (images only) */}
          {currentFile.type === 'image' && (
            <div className={styles.zoomButtons}>
              <button
                className={styles.toolbarButton}
                onClick={zoomOut}
                disabled={zoom <= 0.5}
                title="Zoom Out (-)"
              >
                −
              </button>
              <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
              <button
                className={styles.toolbarButton}
                onClick={zoomIn}
                disabled={zoom >= 3}
                title="Zoom In (+)"
              >
                +
              </button>
              <button
                className={styles.toolbarButton}
                onClick={resetZoom}
                title="Reset Zoom (0)"
              >
                ⊙
              </button>
            </div>
          )}

          {/* Download button */}
          {currentFile.url && (
            <button
              className={styles.toolbarButton}
              onClick={downloadFile}
              title="Download"
            >
              ⬇
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            className={styles.toolbarButton}
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Fullscreen (F)"
          >
            {isFullscreen ? '⊡' : '⊞'}
          </button>
        </div>
      </div>

      {/* Media content */}
      <div className={styles.content}>
        {renderMedia()}
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span>
          {currentFile.type === 'image' && currentFile.size && (
            `Size: ${Math.round((currentFile.size || 0) / 1024)} KB`
          )}
          {currentFile.type === 'video' && 'Video file'}
          {currentFile.type === 'audio' && 'Audio file'}
        </span>
        {currentFile.extension && (
          <span>Type: {currentFile.extension.toUpperCase()}</span>
        )}
      </div>
    </div>
  );
}

