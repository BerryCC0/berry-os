/**
 * Full-featured markdown renderer with HackMD parity
 * Supports: tables, footnotes, LaTeX, diagrams, task lists, etc.
 */

'use client';

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';
import styles from './MarkdownRenderer.module.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Initialize mermaid for diagrams
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
    
    // Render diagrams after content updates
    setTimeout(() => {
      mermaid.contentLoaded();
    }, 100);
  }, [content]);

  return (
    <div className={`${styles.markdown} ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,        // Tables, strikethrough, task lists, etc.
          remarkMath,       // LaTeX math
          remarkBreaks,     // Line breaks
        ]}
        rehypePlugins={[
          rehypeRaw,        // Parse HTML in markdown
          rehypeSanitize,   // Sanitize HTML for security
          rehypeKatex,      // Render LaTeX
          rehypeHighlight,  // Syntax highlighting
        ]}
        components={{
          // Custom renderers for specific elements
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            
            // Mermaid diagrams
            if (lang === 'mermaid') {
              return (
                <div className="mermaid">
                  {String(children).replace(/\n$/, '')}
                </div>
              );
            }
            
            // Regular code blocks
            return !inline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          
          // Task lists
          input({ node, checked, ...props }: any) {
            return (
              <input
                type="checkbox"
                checked={checked}
                disabled
                {...props}
              />
            );
          },
          
          // Images with loading states
          img({ node, src, alt, ...props }: any) {
            return (
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className={styles.image}
                {...props}
              />
            );
          },
          
          // Tables with styling
          table({ children }: any) {
            return (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

