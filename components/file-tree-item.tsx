'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileNode, FileStatus } from '@/lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FileTreeItemProps {
  node: FileNode;
  depth?: number;
  selectedFileId: string | null;
  onSelectFile: (file: FileNode) => void;
}

function getStatusColor(status?: FileStatus): string {
  switch (status) {
    case 'compatible':
      return 'bg-green-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-muted-foreground';
  }
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'abap':
      return (
        <div className="flex h-4 w-4 items-center justify-center rounded bg-primary/20 text-[8px] font-bold text-primary">
          AB
        </div>
      );
    case 'xml':
      return (
        <div className="flex h-4 w-4 items-center justify-center rounded bg-orange-500/20 text-[8px] font-bold text-orange-600 dark:text-orange-400">
          {'</>'}
        </div>
      );
    case 'json':
      return (
        <div className="flex h-4 w-4 items-center justify-center rounded bg-yellow-500/20 text-[8px] font-bold text-yellow-600 dark:text-yellow-400">
          {'{}'}
        </div>
      );
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
}

export function FileTreeItem({ node, depth = 0, selectedFileId, onSelectFile }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === 'folder';
  const isSelected = node.id === selectedFileId;
  const paddingLeft = depth * 12 + 8;

  if (isFolder) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'flex w-full items-center gap-1 py-1.5 text-sm hover:bg-accent/50 transition-colors',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
            style={{ paddingLeft }}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-primary" />
            )}
            <span className="truncate font-medium">{node.name}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {node.children?.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <button
      onClick={() => onSelectFile(node)}
      className={cn(
        'flex w-full items-center gap-2 py-1.5 text-sm transition-colors',
        'hover:bg-accent/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        isSelected && 'bg-accent text-accent-foreground'
      )}
      style={{ paddingLeft: paddingLeft + 20 }}
    >
      {getFileIcon(node.name)}
      <span className="flex-1 truncate text-left">{node.name}</span>
      {node.status && (
        <span
          className={cn('h-2 w-2 rounded-full mr-2', getStatusColor(node.status))}
          title={`Status: ${node.status}`}
        />
      )}
    </button>
  );
}
