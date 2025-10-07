import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

/**
 * 可重用的Markdown渲染组件
 * 封装了ReactMarkdown和通用的Markdown样式
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-renderer" style={{
      fontSize: '16px',
      lineHeight: '1.6',
    }}>
      <style jsx global>{`
        /* 通用Markdown样式 */
        .markdown-renderer h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
        }
        .markdown-renderer h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        .markdown-renderer h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .markdown-renderer h4, .markdown-renderer h5, .markdown-renderer h6 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-renderer p {
          margin-bottom: 1rem;
        }
        .markdown-renderer ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .markdown-renderer ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .markdown-renderer li {
          margin-bottom: 0.5rem;
        }
        .markdown-renderer a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .markdown-renderer a:hover {
          color: #2563eb;
        }
        .markdown-renderer strong {
          font-weight: 600;
        }
        .markdown-renderer em {
          font-style: italic;
        }
        .markdown-renderer code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 0.875rem;
        }
        .markdown-renderer pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .markdown-renderer pre code {
          background: none;
          padding: 0;
          border-radius: 0;
        }
        .markdown-renderer blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
        }
        .markdown-renderer hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .markdown-renderer img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .markdown-renderer table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .markdown-renderer th,
        .markdown-renderer td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .markdown-renderer th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};