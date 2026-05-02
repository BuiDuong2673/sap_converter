'use client';

import { FileNode } from '@/lib/types';
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnalysisSummaryProps {
  files: FileNode[];
  onUploadClick: () => void;
}

function getFileStats(nodes: FileNode[]): { compatible: number; warning: number; error: number; total: number } {
  const stats = { compatible: 0, warning: 0, error: 0, total: 0 };
  
  const traverse = (node: FileNode) => {
    if (node.type === 'file') {
      stats.total++;
      if (node.status === 'compatible') stats.compatible++;
      if (node.status === 'warning') stats.warning++;
      if (node.status === 'error') stats.error++;
    }
    node.children?.forEach(traverse);
  };
  
  nodes.forEach(traverse);
  return stats;
}

export function AnalysisSummary({ files, onUploadClick }: AnalysisSummaryProps) {
  const stats = getFileStats(files);
  const readinessScore = stats.total > 0 
    ? Math.round((stats.compatible / stats.total) * 100) 
    : 0;

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            SAP ECC to S/4HANA Migration Analyzer
          </h1>
          <p className="mt-2 text-pretty text-muted-foreground">
            Upload your ABAP source code to analyze compatibility and get AI-powered migration recommendations.
          </p>
        </div>

        {/* Stats cards */}
        {stats.total > 0 ? (
          <>
            {/* Readiness score */}
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Migration Readiness Score</CardTitle>
                <CardDescription>Based on {stats.total} analyzed files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative h-32 w-32">
                    <svg className="h-32 w-32 -rotate-90 transform">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${(readinessScore / 100) * 352} 352`}
                        className={cn(
                          readinessScore >= 70 ? 'text-green-500' :
                          readinessScore >= 40 ? 'text-yellow-500' :
                          'text-red-500'
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{readinessScore}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status breakdown */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-green-500/10 p-2">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.compatible}
                    </p>
                    <p className="text-sm text-muted-foreground">Compatible</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-yellow-500/10 p-2">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.warning}
                    </p>
                    <p className="text-sm text-muted-foreground">Need Changes</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-red-500/10 p-2">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {stats.error}
                    </p>
                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action */}
            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Select a file from the explorer to view detailed analysis and AI recommendations
              </p>
              <Button variant="outline" onClick={onUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Upload More Files
              </Button>
            </div>
          </>
        ) : (
          /* Empty state */
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No files uploaded yet</h3>
              <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
                Upload your SAP ABAP source files or folders to begin the migration analysis
              </p>
              <Button onClick={onUploadClick} size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
