import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  // If content is empty or whitespace only, return null
  if (!content || !content.trim()) {
    return null;
  }

  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-li:my-1", className)}>
      <ReactMarkdown
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Open links in new tab and make them safe
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            />
          ),
          // Style paragraphs
          p: ({ node, ...props }) => (
            <p {...props} className="text-sm text-gray-700 dark:text-gray-300" />
          ),
          // Style lists
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300" />
          ),
          // Style bold text
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-semibold text-gray-900 dark:text-gray-100" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
