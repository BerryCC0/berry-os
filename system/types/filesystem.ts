/**
 * Virtual Filesystem Types
 * Mac OS 8 Finder filesystem structure
 */

export type FileType = 
  | 'folder'
  | 'application'
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'text'
  | 'archive'
  | 'system';

export type SortField = 'name' | 'size' | 'type' | 'dateModified';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'icon' | 'list';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  path: string;
  size?: number; // bytes (only for files)
  dateCreated: Date;
  dateModified: Date;
  icon: string;
  extension?: string;
  isSystem?: boolean; // System files (read-only, special handling)
  appId?: string; // For applications - links to AppConfig
  content?: string; // For text files - inline content
  url?: string; // For media files - path to actual file
  children?: FileSystemItem[]; // For folders
}

export interface FinderState {
  currentPath: string;
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedItems: string[]; // Item IDs
  navigationHistory: string[];
  historyIndex: number;
}

export interface FinderPreferences {
  defaultView: ViewMode;
  showHiddenFiles: boolean;
  iconSize: number;
  listColumns: string[];
  alwaysOpenFoldersInNewWindow: boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

