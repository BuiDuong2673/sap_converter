export type FileStatus = 'compatible' | 'warning' | 'error';

export interface AnalysisIssue {
  line: number;
  type: 'deprecated' | 'incompatible' | 'performance' | 'security';
  message: string;
  suggestion: string;
}

export interface AnalysisResult {
  summary: string;
  issues: AnalysisIssue[];
  recommendations: string[];
  migrationEffort: 'low' | 'medium' | 'high';
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  status?: FileStatus;
  content?: string;
  suggestedContent?: string;
  analysis?: AnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeSnippet?: string;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
  originalLineNumber?: number;
}

export type DiffMode = 'inline' | 'split';
