'use client';

import { Search, RefreshCw, Filter } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileTreeItem } from '@/components/file-tree-item';
import { FileNode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FileExplorerProps {
  files: FileNode[];
  selectedFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  className?: string;
}

export function FileExplorer({ files, selectedFileId, onSelectFile, className }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filterFiles = (nodes: FileNode[]): FileNode[] => {
    return nodes.reduce<FileNode[]>((acc, node) => {
      if (node.type === 'folder') {
        const filteredChildren = filterFiles(node.children || []);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      } else {
        const matchesSearch = searchQuery === '' || 
          node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === null || node.status === statusFilter;
        
        if (matchesSearch && matchesStatus) {
          acc.push(node);
        }
      }
      return acc;
    }, []);
  };

  const filteredFiles = filterFiles(files);

  const getStatusCounts = (nodes: FileNode[]): Record<string, number> => {
    const counts: Record<string, number> = { compatible: 0, warning: 0, error: 0 };
    
    const traverse = (node: FileNode) => {
      if (node.type === 'file' && node.status) {
        counts[node.status]++;
      }
      node.children?.forEach(traverse);
    };
    
    nodes.forEach(traverse);
    return counts;
  };

  const statusCounts = getStatusCounts(files);

  return (
    <div className={cn('flex h-full flex-col bg-sidebar', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-sidebar-border p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>

      {/* Status filters */}
      {showFilters && (
        <div className="border-b border-sidebar-border p-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStatusFilter(null)}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
                statusFilter === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('compatible')}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
                statusFilter === 'compatible'
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {statusCounts.compatible}
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
                statusFilter === 'warning'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              {statusCounts.warning}
            </button>
            <button
              onClick={() => setStatusFilter('error')}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
                statusFilter === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {statusCounts.error}
            </button>
          </div>
        </div>
      )}

      {/* File tree */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filteredFiles.map((node) => (
            <FileTreeItem
              key={node.id}
              node={node}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
            />
          ))}
          {filteredFiles.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No files found
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Summary footer */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Migration Status</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {statusCounts.compatible}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              {statusCounts.warning}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {statusCounts.error}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
