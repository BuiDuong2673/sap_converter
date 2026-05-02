'use client';

import { useState, useCallback } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Header } from '@/components/header';
import { FileExplorer } from '@/components/file-explorer';
import { CodeViewer } from '@/components/code-viewer';
import { AIChatPanel } from '@/components/ai-chat-panel';
import { UploadDialog } from '@/components/upload-dialog';
import { mockFileTree, initialChatMessages } from '@/lib/mock-data';
import { FileNode, DiffMode, ChatMessage } from '@/lib/types';

export default function MigrationAnalyzer() {
  // File state
  const [files] = useState<FileNode[]>(mockFileTree);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [openTabs, setOpenTabs] = useState<FileNode[]>([]);
  
  // UI state
  const [diffMode, setDiffMode] = useState<DiffMode>('inline');
  const [chatVisible, setChatVisible] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);

  const handleSelectFile = useCallback((file: FileNode) => {
    setSelectedFile(file);
    
    // Add to open tabs if not already open
    setOpenTabs(prev => {
      if (prev.some(tab => tab.id === file.id)) {
        return prev;
      }
      return [...prev, file];
    });
  }, []);

  const handleCloseTab = useCallback((fileId: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== fileId);
      
      // If we closed the selected file, select another tab
      if (selectedFile?.id === fileId) {
        const closedIndex = prev.findIndex(tab => tab.id === fileId);
        const newSelectedIndex = Math.min(closedIndex, newTabs.length - 1);
        if (newTabs[newSelectedIndex]) {
          setSelectedFile(newTabs[newSelectedIndex]);
        } else {
          setSelectedFile(null);
        }
      }
      
      return newTabs;
    });
  }, [selectedFile]);

  const handleSendMessage = useCallback((message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  }, []);

  const handleUploadComplete = useCallback((uploadedFiles: File[]) => {
    // In a real app, this would process the files and add them to the tree
    console.log('Files uploaded:', uploadedFiles);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <Header
        diffMode={diffMode}
        onDiffModeChange={setDiffMode}
        onUploadClick={() => setUploadDialogOpen(true)}
        chatVisible={chatVisible}
        onChatToggle={() => setChatVisible(!chatVisible)}
      />

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* File Explorer Panel */}
          <ResizablePanel
            defaultSize={18}
            minSize={15}
            maxSize={30}
            className="min-w-0"
          >
            <FileExplorer
              files={files}
              selectedFileId={selectedFile?.id || null}
              onSelectFile={handleSelectFile}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Code Viewer Panel */}
          <ResizablePanel
            defaultSize={chatVisible ? 52 : 82}
            minSize={30}
            className="min-w-0"
          >
            <CodeViewer
              selectedFile={selectedFile}
              openTabs={openTabs}
              diffMode={diffMode}
              files={files}
              onCloseTab={handleCloseTab}
              onSelectTab={handleSelectFile}
              onUploadClick={() => setUploadDialogOpen(true)}
            />
          </ResizablePanel>

          {/* AI Chat Panel */}
          {chatVisible && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={30}
                minSize={20}
                maxSize={40}
                className="min-w-0"
              >
                <AIChatPanel
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  selectedFile={selectedFile}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
