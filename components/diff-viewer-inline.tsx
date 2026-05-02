'use client';

import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DiffLine } from '@/lib/types';

interface DiffViewerInlineProps {
  originalContent: string;
  suggestedContent: string;
}

function computeDiff(original: string, suggested: string): DiffLine[] {
  const originalLines = original.split('\n');
  const suggestedLines = suggested.split('\n');
  const result: DiffLine[] = [];
  
  let lineNumber = 1;
  let i = 0;
  let j = 0;
  
  while (i < originalLines.length || j < suggestedLines.length) {
    const origLine = originalLines[i];
    const suggLine = suggestedLines[j];
    
    if (origLine === suggLine) {
      // Unchanged line
      result.push({
        type: 'unchanged',
        content: origLine || '',
        lineNumber: lineNumber++
      });
      i++;
      j++;
    } else if (origLine !== undefined && (suggLine === undefined || originalLines.slice(i).indexOf(suggLine) === -1)) {
      // Line was removed
      result.push({
        type: 'removed',
        content: origLine,
        lineNumber: lineNumber++,
        originalLineNumber: i + 1
      });
      i++;
    } else if (suggLine !== undefined) {
      // Line was added
      result.push({
        type: 'added',
        content: suggLine,
        lineNumber: lineNumber++
      });
      j++;
    } else {
      break;
    }
  }
  
  return result;
}

export function DiffViewerInline({ originalContent, suggestedContent }: DiffViewerInlineProps) {
  const diffLines = useMemo(
    () => computeDiff(originalContent, suggestedContent),
    [originalContent, suggestedContent]
  );

  return (
    <ScrollArea className="h-full">
      <div className="min-w-max">
        {diffLines.map((line, index) => (
          <div
            key={index}
            className={cn(
              'flex font-mono text-sm leading-6',
              line.type === 'added' && 'bg-[var(--diff-added-bg)]',
              line.type === 'removed' && 'bg-[var(--diff-removed-bg)]'
            )}
          >
            {/* Line number */}
            <div className="sticky left-0 flex w-12 shrink-0 items-center justify-end bg-inherit pr-3 text-xs text-[var(--line-number)] select-none">
              {line.lineNumber}
            </div>
            
            {/* Diff indicator */}
            <div className="w-6 shrink-0 text-center select-none">
              {line.type === 'added' && (
                <span className="text-[var(--diff-added-text)] font-bold">+</span>
              )}
              {line.type === 'removed' && (
                <span className="text-[var(--diff-removed-text)] font-bold">-</span>
              )}
            </div>
            
            {/* Code content */}
            <pre className={cn(
              'flex-1 pr-4',
              line.type === 'added' && 'text-[var(--diff-added-text)]',
              line.type === 'removed' && 'text-[var(--diff-removed-text)] line-through opacity-70'
            )}>
              <code>{line.content || ' '}</code>
            </pre>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
