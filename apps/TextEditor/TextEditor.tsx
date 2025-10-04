'use client';

/**
 * Text Editor
 * Simple Mac OS 8 style text editor
 */

import { useState, useEffect } from 'react';
import { getStateFromURL } from '../../app/lib/utils/stateUtils';
import { eventBus } from '../../system/lib/eventBus';
import { clipboard } from '../../system/lib/clipboard';
import type { FileOpenData } from '../../system/lib/fileOpener';
import styles from './TextEditor.module.css';

interface TextEditorProps {
  windowId: string;
}

interface TextEditorState {
  content: string;
  filename: string;
  isDirty: boolean;
}

export default function TextEditor({ windowId }: TextEditorProps) {
  const [state, setState] = useState<TextEditorState>(() => {
    // Try to load file from URL state
    const urlState = getStateFromURL<FileOpenData>('text-editor');
    
    if (urlState?.file) {
      return {
        content: urlState.file.content || '',
        filename: urlState.file.name,
        isDirty: false,
      };
    }
    
    return {
      content: '',
      filename: 'Untitled',
      isDirty: false,
    };
  });

  const [selectedText, setSelectedText] = useState('');

  // Menu action handlers
  useEffect(() => {
    const subscription = eventBus.subscribe('MENU_ACTION', (payload) => {
      const { action } = payload as any;
      
      switch (action) {
        case 'file:new':
          if (state.isDirty) {
            if (confirm('Discard unsaved changes?')) {
              setState({ content: '', filename: 'Untitled', isDirty: false });
            }
          } else {
            setState({ content: '', filename: 'Untitled', isDirty: false });
          }
          break;
        
        case 'edit:cut':
          if (selectedText) {
            clipboard.cut('text', selectedText);
            handleCut();
          }
          break;
        
        case 'edit:copy':
          if (selectedText) {
            clipboard.copy('text', selectedText);
          }
          break;
        
        case 'edit:paste':
          const clipboardData = clipboard.paste();
          if (clipboardData && clipboardData.type === 'text') {
            handlePaste(clipboardData.data);
          }
          break;
        
        case 'edit:select-all':
          handleSelectAll();
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [selectedText, state]);

  // Handle text changes
  const handleContentChange = (newContent: string) => {
    setState({
      ...state,
      content: newContent,
      isDirty: true,
    });
  };

  // Selection handling
  const handleSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const selected = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );
    setSelectedText(selected);
  };

  // Edit operations
  const handleCut = () => {
    // Browser handles this via textarea
    setState({ ...state, isDirty: true });
  };

  const handlePaste = (text: string) => {
    // Would need to insert at cursor position
    // For now, just append
    setState({
      ...state,
      content: state.content + text,
      isDirty: true,
    });
  };

  const handleSelectAll = () => {
    const textarea = document.querySelector(`.${styles.textarea}`) as HTMLTextAreaElement;
    if (textarea) {
      textarea.select();
      setSelectedText(textarea.value);
    }
  };

  // Word and character count
  const wordCount = state.content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = state.content.length;

  return (
    <div className={styles.editor}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filename}>
          {state.filename}{state.isDirty ? ' *' : ''}
        </div>
        <div className={styles.stats}>
          {wordCount} words · {charCount} characters
        </div>
      </div>

      {/* Text Area */}
      <textarea
        className={styles.textarea}
        value={state.content}
        onChange={(e) => handleContentChange(e.target.value)}
        onSelect={handleSelection}
        placeholder="Start typing..."
        spellCheck={false}
        autoFocus
      />

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          {state.isDirty ? 'Modified' : 'Saved'}
        </div>
        <div className={styles.statusRight}>
          Plain Text
        </div>
      </div>
    </div>
  );
}

