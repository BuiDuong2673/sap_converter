'use client';

import { cn } from '@/lib/utils';

interface DiffViewerSplitProps {
  originalContent: string;
  suggestedContent: string;
}

function CodePanel({ 
  content, 
  title, 
  variant 
}: { 
  content: string; 
  title: string;
  variant: 'original' | 'suggested';
}) {
  const lines = content.split('\n');
  
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Panel header */}
      <div className={cn(
        'flex shrink-0 items-center justify-between border-b px-3 py-1.5',
        variant === 'original' 
          ? 'border-[var(--diff-removed-bg)] bg-[var(--diff-removed-bg)]' 
          : 'border-[var(--diff-added-bg)] bg-[var(--diff-added-bg)]'
      )}>
        <span className={cn(
          'text-xs font-medium',
          variant === 'original' ? 'text-[var(--diff-removed-text)]' : 'text-[var(--diff-added-text)]'
        )}>
          {title}
        </span>
        <span className="text-xs text-muted-foreground">
          {lines.length} lines
        </span>
      </div>
      
      {/* Code content - scrollable */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="min-w-max">
          {lines.map((line, index) => (
            <div
              key={index}
              className="flex font-mono text-sm leading-6 hover:bg-accent/30"
            >
              {/* Line number */}
              <div className="sticky left-0 flex w-12 shrink-0 items-center justify-end bg-card pr-3 text-xs text-[var(--line-number)] select-none border-r border-border">
                {index + 1}
              </div>
              
              {/* Code content */}
              <pre className="flex-1 pl-3 pr-4">
                <code>{line || ' '}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DiffViewerSplit({ originalContent, suggestedContent }: DiffViewerSplitProps) {
  return (
    <div className="flex h-full w-full">
      {/* Original panel - exactly 50% width */}
      <div className="w-1/2 border-r border-border overflow-hidden">
        <CodePanel 
          content={originalContent} 
          title="Original (ECC)" 
          variant="original" 
        />
      </div>
      
      {/* Suggested panel - exactly 50% width */}
      <div className="w-1/2 overflow-hidden">
        <CodePanel 
          content={suggestedContent} 
          title="Suggested (S/4HANA)" 
          variant="suggested" 
        />
      </div>
    </div>
  );
}
