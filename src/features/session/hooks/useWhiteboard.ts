import { useState, useCallback } from 'react';
import type { WhiteboardDrawElement, WhiteboardPayload } from '../types';

export const useWhiteboard = (onSync?: (payload: WhiteboardPayload) => void) => {
  const [elements, setElements] = useState<WhiteboardDrawElement[]>([]);
  const [currentTool, setCurrentTool] = useState<
    'pencil' | 'eraser' | 'line' | 'rectangle' | 'circle'
  >('pencil');
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [currentWidth, setCurrentWidth] = useState(3);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  const addElement = useCallback(
    (element: WhiteboardDrawElement) => {
      setElements((prev) => {
        const next = [...prev, element];
        if (onSync) onSync({ elements: next });
        return next;
      });
    },
    [onSync],
  );

  const clearBoard = useCallback(() => {
    setElements([]);
    if (onSync) onSync({ elements: [], clear: true });
  }, [onSync]);

  const undo = useCallback(() => {
    setElements((prev) => {
      const next = prev.slice(0, -1);
      if (onSync) onSync({ elements: next });
      return next;
    });
  }, [onSync]);

  const handleRemoteUpdate = useCallback((payload: WhiteboardPayload) => {
    if (payload.clear) {
      setElements([]);
    } else if (payload.elements) {
      setElements(payload.elements);
    }
  }, []);

  return {
    elements,
    currentTool,
    currentColor,
    currentWidth,
    isWhiteboardOpen,
    setCurrentTool,
    setCurrentColor,
    setCurrentWidth,
    setIsWhiteboardOpen,
    addElement,
    clearBoard,
    undo,
    handleRemoteUpdate,
  };
};
