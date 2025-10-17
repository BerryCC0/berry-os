/**
 * Rich toolbar for markdown editing
 * HackMD-style formatting buttons
 */

'use client';

import React from 'react';
import styles from './EditorToolbar.module.css';

interface EditorToolbarProps {
  onInsert: (before: string, after: string, placeholder?: string) => void;
  onUploadImage: () => void;
  disabled?: boolean;
}

export function EditorToolbar({ onInsert, onUploadImage, disabled }: EditorToolbarProps) {
  const tools = [
    { icon: 'B', title: 'Bold', before: '**', after: '**', placeholder: 'bold text' },
    { icon: 'I', title: 'Italic', before: '*', after: '*', placeholder: 'italic text' },
    { icon: 'S', title: 'Strikethrough', before: '~~', after: '~~', placeholder: 'strikethrough' },
    { icon: 'H1', title: 'Heading 1', before: '# ', after: '', placeholder: 'heading' },
    { icon: 'H2', title: 'Heading 2', before: '## ', after: '', placeholder: 'heading' },
    { icon: 'H3', title: 'Heading 3', before: '### ', after: '', placeholder: 'heading' },
    { icon: '⋮', title: 'Bullet List', before: '- ', after: '', placeholder: 'list item' },
    { icon: '1.', title: 'Numbered List', before: '1. ', after: '', placeholder: 'list item' },
    { icon: '☐', title: 'Task List', before: '- [ ] ', after: '', placeholder: 'task' },
    { icon: '""', title: 'Quote', before: '> ', after: '', placeholder: 'quote' },
    { icon: '</>', title: 'Code', before: '`', after: '`', placeholder: 'code' },
    { icon: '```', title: 'Code Block', before: '```\n', after: '\n```', placeholder: 'code block' },
    { icon: '🔗', title: 'Link', before: '[', after: '](url)', placeholder: 'link text' },
    { icon: '📊', title: 'Table', before: '| Header |\n| --- |\n| ', after: ' |', placeholder: 'cell' },
    { icon: 'Σ', title: 'Math (inline)', before: '$', after: '$', placeholder: 'equation' },
    { icon: '∫', title: 'Math (block)', before: '$$\n', after: '\n$$', placeholder: 'equation' },
    { icon: '📈', title: 'Mermaid Diagram', before: '```mermaid\ngraph TD\n  A[', after: '] --> B[End]\n```', placeholder: 'Start' },
  ];

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolGroup}>
        {tools.map((tool, i) => (
          <button
            key={i}
            type="button"
            className={styles.toolButton}
            onClick={() => onInsert(tool.before, tool.after, tool.placeholder)}
            title={tool.title}
            disabled={disabled}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      
      <div className={styles.toolGroup}>
        <button
          type="button"
          className={`${styles.toolButton} ${styles.uploadButton}`}
          onClick={onUploadImage}
          title="Upload Image to IPFS/Arweave"
          disabled={disabled}
        >
          🖼️ Upload
        </button>
      </div>
    </div>
  );
}

