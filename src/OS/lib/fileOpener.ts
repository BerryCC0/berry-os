/**
 * File Opener System
 * Routes file opens to appropriate applications
 */

import type { FileSystemItem } from '../types/filesystem';
import type { AppConfig } from '../types/system';

/**
 * Get the appropriate app to open a file type
 */
export function getAppForFileType(item: FileSystemItem): string | null {
  if (item.type === 'folder') {
    return 'finder';
  }
  
  if (item.type === 'application' && item.appId) {
    return item.appId;
  }
  
  // Media files go to Media Viewer
  if (['image', 'video', 'audio'].includes(item.type)) {
    return 'media-viewer';
  }
  
  // Text files go to Text Editor (Phase 5+)
  if (item.type === 'text' || item.type === 'document') {
    return 'text-editor'; // Will implement later
  }
  
  // Default: no app
  return null;
}

/**
 * Check if a file can be opened
 */
export function canOpenFile(item: FileSystemItem): boolean {
  return getAppForFileType(item) !== null;
}

/**
 * Serialize file data for passing to apps
 */
export interface FileOpenData {
  file: FileSystemItem;
  folderPath: string; // For navigation context
  siblings?: FileSystemItem[]; // For prev/next
}

export function createFileOpenData(
  file: FileSystemItem,
  folderPath: string,
  siblings?: FileSystemItem[]
): FileOpenData {
  return {
    file,
    folderPath,
    siblings: siblings?.filter(s => s.type === file.type), // Only same type
  };
}

