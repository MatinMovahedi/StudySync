'use client';
import { useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

interface Props {
  initialState: Record<string, unknown>;
  onSave: (state: Record<string, unknown>) => void;
  theme: 'dark' | 'light';
}

export default function WhiteboardCanvas({ initialState, onSave, theme }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiRef = useRef<any>(null);
  const pendingRef = useRef<Record<string, unknown> | null>(null);
  const lastSavedRef = useRef('');
  const lastRemoteAtRef = useRef('');

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
