'use client';

import { Upload, Columns2, Rows3, MessageSquare, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { DiffMode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  diffMode: DiffMode;
  onDiffModeChange: (mode: DiffMode) => void;
  onUploadClick: () => void;
  chatVisible: boolean;
  onChatToggle: () => void;
}

function DeloitteLogo() {
  return (
    <svg
      viewBox="0 0 113 24"
      fill="currentColor"
      className="h-5 text-primary"
      aria-label="Deloitte"
    >
      <path d="M0 19.5h7.9c4.7 0 8.5-2.3 8.5-6.8 0-3.3-2.1-5.1-5.4-5.7v-.1c2.7-.6 4.4-2.2 4.4-4.7C15.4 0 12.6 0 8.6 0H0v19.5zM5.3 4.2h2.6c2.1 0 2.8.8 2.8 2.3 0 1.6-1 2.5-3.1 2.5H5.3V4.2zm0 8.9h2.9c2.2 0 3.2 1 3.2 2.7 0 1.9-1.3 2.6-3.4 2.6H5.3v-5.3zM24.7 14.9c0-3.1 1.5-5.7 4.5-5.7 3 0 4.5 2.6 4.5 5.7 0 3.2-1.5 5.7-4.5 5.7-3 0-4.5-2.5-4.5-5.7m-5.3 0c0 5.5 4.1 9.1 9.8 9.1s9.8-3.6 9.8-9.1c0-5.6-4.1-9.2-9.8-9.2s-9.8 3.6-9.8 9.2M46.7 4.2h-5.3v15.3h5.3V4.2zM56.9 14.3h4.8v-3.8h-4.8V8h5.5V4.2H51.6v15.3h11.2v-3.8h-5.9v-1.4zM68.2 4.2h5.3v11.5h5.9v3.8H68.2V4.2zM84.5 14.3h4.8v-3.8h-4.8V8H90V4.2H79.2v15.3H90.4v-3.8h-5.9v-1.4zM99.7 4.2h-5.3v15.3h5.3V4.2zM113 4.2h-5.3v15.3h5.3V4.2z" />
    </svg>
  );
}

export function Header({ 
  diffMode, 
  onDiffModeChange, 
  onUploadClick,
  chatVisible,
  onChatToggle
}: HeaderProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b bg-card px-4">
      {/* Left section - Logo and title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <span className="text-sm font-bold text-primary-foreground">D.</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold">SAP Migration Analyzer</h1>
            <p className="text-xs text-muted-foreground">ECC to S/4HANA</p>
          </div>
        </div>
      </div>

      {/* Center section - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUploadClick}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>

        {/* Diff mode toggle */}
        <div className="flex items-center rounded-md border p-0.5">
          <Button
            variant={diffMode === 'inline' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => onDiffModeChange('inline')}
          >
            <Rows3 className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline text-xs">Inline</span>
          </Button>
          <Button
            variant={diffMode === 'split' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => onDiffModeChange('split')}
          >
            <Columns2 className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline text-xs">Split</span>
          </Button>
        </div>
      </div>

      {/* Right section - Tools and user */}
      <div className="flex items-center gap-1">
        <Button
          variant={chatVisible ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={onChatToggle}
        >
          {chatVisible ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle AI Chat</span>
        </Button>
        <ThemeToggle />
        <div className="mx-2 h-6 w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}
