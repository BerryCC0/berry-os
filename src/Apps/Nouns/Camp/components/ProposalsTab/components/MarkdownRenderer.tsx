/**
 * MarkdownRenderer Component
 * Renders markdown with support for images, links, and video embeds
 */

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import styles from './MarkdownRenderer.module.css';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Custom components for markdown elements
  const components: Components = {
    // Links - open in new tab with security
    a: ({ node, ...props }) => (
      <a
        {...props}
        className={styles.link}
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
    
    // Images - responsive with max width
    img: ({ node, ...props }) => (
      <img
        {...props}
        className={styles.image}
        loading="lazy"
        alt={props.alt || 'Proposal image'}
      />
    ),
    
    // Paragraphs
    p: ({ node, ...props }) => (
      <p {...props} className={styles.paragraph} />
    ),
    
    // Headings
    h1: ({ node, ...props }) => (
      <h1 {...props} className={styles.h1} />
    ),
    h2: ({ node, ...props }) => (
      <h2 {...props} className={styles.h2} />
    ),
    h3: ({ node, ...props }) => (
      <h3 {...props} className={styles.h3} />
    ),
    
    // Lists
    ul: ({ node, ...props }) => (
      <ul {...props} className={styles.ul} />
    ),
    ol: ({ node, ...props }) => (
      <ol {...props} className={styles.ol} />
    ),
    li: ({ node, ...props }) => (
      <li {...props} className={styles.li} />
    ),
    
    // Code blocks
    code: ({ node, className, ...props }) => {
      const isInline = !className?.includes('language-');
      return isInline ? (
        <code {...props} className={styles.inlineCode} />
      ) : (
        <code {...props} className={`${styles.codeBlock} ${className || ''}`} />
      );
    },
    pre: ({ node, ...props }) => (
      <pre {...props} className={styles.pre} />
    ),
    
    // Blockquotes
    blockquote: ({ node, ...props }) => (
      <blockquote {...props} className={styles.blockquote} />
    ),
    
    // Tables (GitHub Flavored Markdown)
    table: ({ node, ...props }) => (
      <div className={styles.tableWrapper}>
        <table {...props} className={styles.table} />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th {...props} className={styles.th} />
    ),
    td: ({ node, ...props }) => (
      <td {...props} className={styles.td} />
    ),
    
    // Horizontal rule
    hr: ({ node, ...props }) => (
      <hr {...props} className={styles.hr} />
    ),
  };

  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

