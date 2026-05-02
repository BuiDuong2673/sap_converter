'use client';

import { X, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DiffViewerInline } from '@/components/diff-viewer-inline';
import { DiffViewerSplit } from '@/components/diff-viewer-split';
import { AnalysisSummary } from '@/components/analysis-summary';
import { FileNode, DiffMode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CodeViewerProps {
  selectedFile: FileNode | null;
  openTabs: FileNode[];
  diffMode: DiffMode;
  files: FileNode[];
  onCloseTab: (fileId: string) => void;
  onSelectTab: (file: FileNode) => void;
  onUploadClick: () => void;
}

function getStatusIcon(status?: string) {
  switch (status) {
    case 'compatible':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
}

function getEffortBadge(effort?: string) {
  switch (effort) {
    case 'low':
      return <Badge variant="outline" className="border-green-500/50 text-green-600 dark:text-green-400">Low Effort</Badge>;
    case 'medium':
      return <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400">Medium Effort</Badge>;
    case 'high':
      return <Badge variant="outline" className="border-red-500/50 text-red-600 dark:text-red-400">High Effort</Badge>;
    default:
      return null;
  }
}

export function CodeViewer({ 
  selectedFile, 
  openTabs, 
  diffMode, 
  files,
  onCloseTab, 
  onSelectTab,
  onUploadClick
}: CodeViewerProps) {
  if (!selectedFile) {
    return <AnalysisSummary files={files} onUploadClick={onUploadClick} />;
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Tab bar */}
      <div className="flex items-center border-b bg-muted/30">
        <div className="flex flex-1 overflow-x-auto custom-scrollbar">
          {openTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab)}
              className={cn(
                'group flex shrink-0 items-center gap-2 border-r px-3 py-2 text-sm transition-colors',
                'hover:bg-accent/50',
                tab.id === selectedFile.id
                  ? 'bg-card border-b-2 border-b-primary'
                  : 'bg-muted/50 text-muted-foreground'
              )}
            >
              {getStatusIcon(tab.status)}
              <span className="max-w-32 truncate">{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="ml-1 rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Content area with analysis panel */}
      <Tabs defaultValue="diff" className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <TabsList className="h-8">
            <TabsTrigger value="diff" className="text-xs">Code Diff</TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
          </TabsList>
          
          {selectedFile.analysis && (
            <div className="flex items-center gap-2">
              {getEffortBadge(selectedFile.analysis.migrationEffort)}
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {selectedFile.analysis.issues.length} issues
              </Badge>
            </div>
          )}
        </div>

        <TabsContent value="diff" className="flex-1 overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col">
          <div className="flex h-full w-full flex-1 overflow-hidden">
            {selectedFile.content && selectedFile.suggestedContent ? (
              diffMode === 'inline' ? (
                <DiffViewerInline
                  originalContent={selectedFile.content}
                  suggestedContent={selectedFile.suggestedContent}
                />
              ) : (
                <DiffViewerSplit
                  originalContent={selectedFile.content}
                  suggestedContent={selectedFile.suggestedContent}
                />
              )
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                No diff available for this file
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="flex-1 overflow-hidden m-0 data-[state=active]:flex">
          <ScrollArea className="flex-1 p-4">
            {selectedFile.analysis ? (
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="mb-2 font-semibold">Summary</h3>
                  <p className="text-sm text-muted-foreground">{selectedFile.analysis.summary}</p>
                </div>

                {/* Issues */}
                {selectedFile.analysis.issues.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-semibold">Issues Found</h3>
                    <div className="space-y-3">
                      {selectedFile.analysis.issues.map((issue, index) => (
                        <div
                          key={index}
                          className={cn(
                            'rounded-lg border p-3',
                            issue.type === 'deprecated' && 'border-yellow-500/30 bg-yellow-500/5',
                            issue.type === 'incompatible' && 'border-red-500/30 bg-red-500/5',
                            issue.type === 'performance' && 'border-blue-500/30 bg-blue-500/5',
                            issue.type === 'security' && 'border-red-500/30 bg-red-500/5'
                          )}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {issue.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Line {issue.line}
                            </span>
                          </div>
                          <p className="mb-2 text-sm font-medium">{issue.message}</p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-primary">Suggestion:</span> {issue.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedFile.analysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-semibold">Recommendations</h3>
                    <ul className="space-y-2">
                      {selectedFile.analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground">
                No analysis available for this file
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
