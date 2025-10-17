/**
 * Enhanced MarkdownEditor with full HackMD features
 * - WYSIWYG toolbar
 * - Drag & drop image upload to IPFS/Arweave
 * - Side-by-side edit/preview modes
 * - Live preview with full markdown support
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useDropzone } from 'react-dropzone';
import { EditorToolbar } from './EditorToolbar';
import { MarkdownRenderer } from './MarkdownRenderer';
import { uploadImageToPinata } from '@/app/lib/uploads/pinataUpload';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

type EditorMode = 'edit' | 'preview' | 'split';

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Enter proposal description (full markdown supported)',
  disabled = false,
  rows = 15
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>('split');
  const [uploadProgress, setUploadProgress] = useState<{ percent: number; status: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Insert text at cursor position
  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    onChange(newValue);
    
    // Set cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [value, onChange]);

  // Handle image upload
  const handleImageUpload = useCallback(async (files: File[]) => {
    if (!address) {
      setUploadError('Please connect your wallet to upload images');
      return;
    }

    if (files.length === 0) return;

    const file = files[0];
    setUploadError(null);
    setUploadProgress({ percent: 0, status: 'Starting upload...' });

    try {
      // Create signing function using wagmi's signMessageAsync
      const signFn = async (message: string) => {
        try {
          const signature = await signMessageAsync({ message });
          return signature;
        } catch (err) {
          if ((err as any).code === 4001 || (err as any).name === 'UserRejectedRequestError') {
            throw new Error('Signature request was rejected');
          }
          throw err;
        }
      };

      const result = await uploadImageToPinata(
        file,
        address,
        signFn,
        (percent, status) => setUploadProgress({ percent, status })
      );

      // Insert markdown image at cursor
      const markdown = `![${file.name}](${result.url})`;
      insertAtCursor(markdown);
      
      setUploadProgress(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setUploadProgress(null);
    }
  }, [address, insertAtCursor, signMessageAsync]);

  // Drag & drop setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    multiple: false,
    noClick: true,
    noKeyboard: true,
    disabled: disabled || !address,
  });

  // Handle toolbar insertions
  const handleToolbarInsert = useCallback((before: string, after: string, placeholder?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder || '';
    const newText = before + textToInsert + after;
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    
    // Select the inserted text
    setTimeout(() => {
      textarea.focus();
      const selStart = start + before.length;
      const selEnd = selStart + textToInsert.length;
      textarea.setSelectionRange(selStart, selEnd);
    }, 0);
  }, [value, onChange]);

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) handleImageUpload(Array.from(files));
    };
    input.click();
  };

  // Handle paste events to intercept pasted images
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Check if any clipboard item is an image
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault(); // Prevent default paste behavior

        const file = item.getAsFile();
        if (file) {
          await handleImageUpload([file]);
        }
        return;
      }
    }
  }, [handleImageUpload]);

  return (
    <div className={styles.container}>
      {/* Mode switcher */}
      <div className={styles.modeBar}>
        <div className={styles.modeButtons}>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'edit' ? styles.active : ''}`}
            onClick={() => setMode('edit')}
            disabled={disabled}
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'split' ? styles.active : ''}`}
            onClick={() => setMode('split')}
            disabled={disabled}
          >
            ⚡ Both
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === 'preview' ? styles.active : ''}`}
            onClick={() => setMode('preview')}
            disabled={disabled}
          >
            👁️ Preview
          </button>
        </div>
        
        {!address && (
          <div className={styles.walletWarning}>
            Connect wallet to upload images
          </div>
        )}
      </div>

      {/* Toolbar */}
      {mode !== 'preview' && (
        <EditorToolbar
          onInsert={handleToolbarInsert}
          onUploadImage={handleUploadClick}
          disabled={disabled}
        />
      )}

      {/* Editor area */}
      <div 
        className={`${styles.editorArea} ${mode === 'split' ? styles.split : ''}`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        
        {isDragActive && (
          <div className={styles.dropOverlay}>
            <div className={styles.dropMessage}>
              📎 Drop image to upload to IPFS/Arweave
            </div>
          </div>
        )}

        {/* Edit pane */}
        {mode !== 'preview' && (
          <div className={styles.editPane}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
            />
          </div>
        )}

        {/* Preview pane */}
        {mode !== 'edit' && (
          <div className={styles.previewPane}>
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className={styles.emptyPreview}>
                Nothing to preview yet...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <div className={styles.uploadProgress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${uploadProgress.percent}%` }}
            />
          </div>
          <div className={styles.progressText}>
            {uploadProgress.status} ({uploadProgress.percent}%)
          </div>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className={styles.uploadError}>
          ❌ {uploadError}
        </div>
      )}

      {/* Help text */}
      <div className={styles.hint}>
        Full markdown supported: **bold**, *italic*, tables, math, diagrams, and more. 
        Drag & drop images or click Upload button.
      </div>
    </div>
  );
}
