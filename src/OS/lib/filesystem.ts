/**
 * Virtual Filesystem
 * Mac OS 8 style filesystem with read-only structure
 */

import type { FileSystemItem, FileType } from '../types/filesystem';

/**
 * Get application items dynamically from registered apps
 * This allows the filesystem to stay in sync with AppConfig
 */
function getApplicationItems(): FileSystemItem[] {
  // Import here to avoid circular dependency
  // Dynamic import would be better but filesystem needs to be sync
  // So we'll use a function that gets called during initialization
  
  // This will be populated by initializeApplicationsFolder() after app loads
  return [];
}

/**
 * Root filesystem structure
 * This represents the Mac OS 8 hard drive
 */
export const ROOT_FILESYSTEM: FileSystemItem = {
  id: 'root',
  name: 'Macintosh HD',
  type: 'folder',
  path: '/',
  dateCreated: new Date('2025-01-01'),
  dateModified: new Date('2025-10-03'),
  icon: '/icons/system/disk.svg',
  children: [
    {
      id: 'system',
      name: 'System Folder',
      type: 'folder',
      path: '/System Folder',
      dateCreated: new Date('2025-01-01'),
      dateModified: new Date('2025-10-03'),
      icon: '/icons/system/folder-system.svg',
      isSystem: true,
      children: [
        {
          id: 'system-extensions',
          name: 'Extensions',
          type: 'folder',
          path: '/System Folder/Extensions',
          dateCreated: new Date('2025-01-01'),
          dateModified: new Date('2025-01-01'),
          icon: '/icons/system/folder.svg',
          isSystem: true,
          children: [],
        },
        {
          id: 'system-preferences',
          name: 'Preferences',
          type: 'folder',
          path: '/System Folder/Preferences',
          dateCreated: new Date('2025-01-01'),
          dateModified: new Date('2025-10-03'),
          icon: '/icons/system/folder.svg',
          isSystem: true,
          children: [],
        },
      ],
    },
    {
      id: 'applications',
      name: 'Applications',
      type: 'folder',
      path: '/Applications',
      dateCreated: new Date('2025-01-01'),
      dateModified: new Date('2025-10-03'),
      icon: '/icons/system/folder-applications.svg',
      children: [], // Will be populated dynamically
    },
    {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      path: '/Documents',
      dateCreated: new Date('2025-01-01'),
      dateModified: new Date('2025-10-03'),
      icon: '/icons/system/folder-documents.svg',
      children: [
        {
          id: 'doc-readme',
          name: 'Read Me',
          type: 'text',
          path: '/Documents/Read Me',
          extension: 'txt',
          dateCreated: new Date('2025-10-03'),
          dateModified: new Date('2025-10-03'),
          icon: '/icons/system/file-text.svg',
          size: 2048,
          content: `Welcome to Nouns OS!

This is a simple text file that demonstrates the Text Editor app.

Nouns OS is a Mac OS 8 emulator built with modern web technologies. It features:

- Complete Mac OS 8 Finder experience
- Window management with dragging, resizing, and minimize
- Desktop icons with fluid positioning
- Context-aware menu bar
- Clipboard system for cut/copy/paste
- Mobile support with touch gestures
- Deep linking for shareable states

Apps Included:
- Finder: Browse the virtual filesystem
- Calculator: Perform calculations with shareable state
- Media Viewer: View images, videos, and audio
- Text Editor: View and edit text files (you're using it now!)
- Berry: Information about the project

Feel free to edit this text and explore the menu bar actions!

Try:
- Edit → Copy to copy selected text
- Edit → Paste to paste from clipboard
- Edit → Select All to select everything
- File → New to create a new document

Enjoy exploring Nouns OS!`,
        },
        {
          id: 'doc-notes',
          name: 'My Notes',
          type: 'text',
          path: '/Documents/My Notes',
          extension: 'txt',
          dateCreated: new Date('2025-10-01'),
          dateModified: new Date('2025-10-02'),
          icon: '/icons/system/file-text.svg',
          size: 512,
          content: 'These are my notes about the system...',
        },
      ],
    },
    {
      id: 'pictures',
      name: 'Pictures',
      type: 'folder',
      path: '/Pictures',
      dateCreated: new Date('2025-01-01'),
      dateModified: new Date('2025-10-03'),
      icon: '/icons/system/folder-pictures.svg',
      children: [
        {
          id: 'pic-sample1',
          name: 'Sample Image 1',
          type: 'image',
          path: '/Pictures/Sample Image 1',
          extension: 'jpg',
          dateCreated: new Date('2025-09-15'),
          dateModified: new Date('2025-09-15'),
          icon: '/icons/system/file-image.svg',
          size: 245000,
          url: '/filesystem/Pictures/sample1.jpg',
        },
        {
          id: 'pic-sample2',
          name: 'Sample Image 2',
          type: 'image',
          path: '/Pictures/Sample Image 2',
          extension: 'png',
          dateCreated: new Date('2025-09-20'),
          dateModified: new Date('2025-09-20'),
          icon: '/icons/system/file-image.svg',
          size: 189000,
          url: '/filesystem/Pictures/sample2.png',
        },
      ],
    },
    {
      id: 'music',
      name: 'Music',
      type: 'folder',
      path: '/Music',
      dateCreated: new Date('2025-01-01'),
      dateModified: new Date('2025-10-03'),
      icon: '/icons/system/folder-music.svg',
      children: [],
    },
    {
      id: 'desktop',
      name: 'Desktop',
      type: 'folder',
      path: '/Desktop',
      dateCreated: new Date('2025-01-01'),
      dateModified: new Date('2025-10-03'),
      icon: '/icons/system/folder.svg',
      children: [],
    },
  ],
};

/**
 * Get item by path
 */
export function getItemByPath(path: string, root: FileSystemItem = ROOT_FILESYSTEM): FileSystemItem | null {
  if (path === '/' || path === '') {
    return root;
  }

  const parts = path.split('/').filter(Boolean);
  let current = root;

  for (const part of parts) {
    if (!current.children) return null;
    
    const next = current.children.find((child) => child.name === part);
    if (!next) return null;
    
    current = next;
  }

  return current;
}

/**
 * Get children of a folder
 */
export function getChildren(path: string): FileSystemItem[] {
  const item = getItemByPath(path);
  
  if (!item || item.type !== 'folder') {
    return [];
  }
  
  return item.children || [];
}

/**
 * Get parent path
 */
export function getParentPath(path: string): string {
  if (path === '/' || path === '') return '/';
  
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  
  return parts.length === 0 ? '/' : '/' + parts.join('/');
}

/**
 * Get breadcrumb trail from path
 */
export function getBreadcrumbs(path: string): Array<{ name: string; path: string }> {
  if (path === '/' || path === '') {
    return [{ name: 'Macintosh HD', path: '/' }];
  }

  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Macintosh HD', path: '/' }];
  
  let currentPath = '';
  for (const part of parts) {
    currentPath += '/' + part;
    breadcrumbs.push({ name: part, path: currentPath });
  }
  
  return breadcrumbs;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 bytes';
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format date (Mac OS 8 style)
 */
export function formatDate(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${month} ${day}, ${year}, ${time}`;
}

/**
 * Get file type display name
 */
export function getFileTypeLabel(item: FileSystemItem): string {
  switch (item.type) {
    case 'folder':
      return 'Folder';
    case 'application':
      return 'Application';
    case 'document':
      return 'Document';
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case 'text':
      return 'Text Document';
    case 'archive':
      return 'Archive';
    case 'system':
      return 'System File';
    default:
      return 'File';
  }
}

/**
 * Sort items
 */
export function sortItems(
  items: FileSystemItem[],
  field: 'name' | 'size' | 'type' | 'dateModified',
  direction: 'asc' | 'desc'
): FileSystemItem[] {
  const sorted = [...items].sort((a, b) => {
    // Always put folders first
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    
    let comparison = 0;
    
    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'dateModified':
        comparison = a.dateModified.getTime() - b.dateModified.getTime();
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

/**
 * Initialize Applications folder with all registered apps
 * This must be called after AppConfig is loaded to avoid circular dependencies
 */
export function initializeApplicationsFolder(apps: Array<{ id: string; name: string; icon: string; description: string; version: string }>) {
  const applicationsFolder = getItemByPath('/Applications');
  
  if (!applicationsFolder) {
    console.error('Applications folder not found in filesystem');
    return;
  }
  
  // Clear existing children and populate with registered apps
  applicationsFolder.children = apps.map((app) => ({
    id: `app-${app.id}`,
    name: app.name,
    type: 'application' as const,
    path: `/Applications/${app.name}`,
    dateCreated: new Date('2025-10-03'),
    dateModified: new Date('2025-10-03'),
    icon: app.icon,
    appId: app.id,
    size: 128000, // Placeholder size
  }));
  
  console.log(`Initialized Applications folder with ${apps.length} apps`);
}

