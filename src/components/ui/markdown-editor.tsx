import { useEffect, useState } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: number;
}

export const MarkdownEditor = ({
  value,
  onChange,
  placeholder,
  className,
  height = 200
}: MarkdownEditorProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Filter out code and code block commands
  const filteredCommands = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.divider,
    commands.link,
    commands.quote,
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
  ];

  return (
    <div className={cn("markdown-editor w-full", className)} data-color-mode={isDark ? 'dark' : 'light'}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview="edit"
        height={height}
        commands={filteredCommands}
        textareaProps={{
          placeholder: placeholder || 'Enter text...'
        }}
        previewOptions={{
          rehypePlugins: []
        }}
        visibleDragbar={false}
      />
    </div>
  );
};
