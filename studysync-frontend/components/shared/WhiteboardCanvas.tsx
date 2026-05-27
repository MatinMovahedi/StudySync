'use client';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

interface Props {
  initialState: Record<string, unknown>;
  onSave: (state: Record<string, unknown>) => void;
  theme: 'dark' | 'light';
}

export interface WhiteboardCanvasHandle {
  addElements: (elements: unknown[]) => void;
  exportPng: () => Promise<void>;
}

const WhiteboardCanvas = forwardRef<WhiteboardCanvasHandle, Props>(
  function WhiteboardCanvas({ initialState, onSave, theme }, ref) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiRef = useRef<any>(null);
    const pendingRef = useRef<Record<string, unknown> | null>(null);
    const lastSavedRef = useRef('');
    const lastRemoteAtRef = useRef('');

    useImperativeHandle(ref, () => ({
      addElements(newElements: unknown[]) {
        if (!apiRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existing: any[] = apiRef.current.getSceneElements() ?? [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiRef.current.updateScene({ elements: [...existing, ...(newElements as any[])] });
      },
      async exportPng() {
        if (!apiRef.current) return;
        try {
          const { exportToBlob } = await import('@excalidraw/excalidraw');
          const elements = apiRef.current.getSceneElements();
          const appState = apiRef.current.getAppState();
          const files = apiRef.current.getFiles();
          const blob = await exportToBlob({ elements, appState, files, mimeType: 'image/png' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'whiteboard.png';
          a.click();
          URL.revokeObjectURL(url);
        } catch {
          // exportToBlob not available — fall back to Excalidraw built-in export
        }
      },
    }));

    // Auto-save every 4 seconds when there are unsaved changes
    useEffect(() => {
      const id = setInterval(() => {
        if (!pendingRef.current) return;
        const snap = JSON.stringify(pendingRef.current);
        if (snap !== lastSavedRef.current) {
          lastSavedRef.current = snap;
          onSave(pendingRef.current);
        }
      }, 4000);
      return () => clearInterval(id);
    }, [onSave]);

    // Apply incoming remote state without triggering a re-save loop
    useEffect(() => {
      const stateKey = JSON.stringify(initialState);
      if (!apiRef.current || !initialState.elements || stateKey === lastRemoteAtRef.current) return;
      lastRemoteAtRef.current = stateKey;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiRef.current.updateScene({ elements: initialState.elements as any[] });
      } catch {}
    }, [initialState]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialData: any = {
      elements: (initialState.elements as unknown[]) ?? [],
      appState: {
        viewBackgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      },
    };

    return (
      <Excalidraw
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        excalidrawAPI={(api: any) => { apiRef.current = api; }}
        initialData={initialData}
        onChange={(elements, state) => {
          pendingRef.current = {
            elements: elements.map(el => ({ ...el })),
            appState: { viewBackgroundColor: state.viewBackgroundColor },
          };
        }}
        theme={theme}
        UIOptions={{ canvasActions: { saveToActiveFile: false, loadScene: false } }}
      />
    );
  }
);

export default WhiteboardCanvas;
