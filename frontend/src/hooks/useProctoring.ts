import { useEffect, useState, useRef } from 'react';

interface ProctoringOptions {
  enabled?: boolean;
  maxWarnings?: number;
  onViolation?: (violationType: string) => void;
  onDisqualify?: () => void;
}

export function useProctoring({ enabled = true, maxWarnings = 3, onViolation, onDisqualify }: ProctoringOptions = {}) {
  const [warnings, setWarnings] = useState<string[]>([]);
  
  const onViolationRef = useRef(onViolation);
  const onDisqualifyRef = useRef(onDisqualify);

  useEffect(() => {
    onViolationRef.current = onViolation;
    onDisqualifyRef.current = onDisqualify;
  }, [onViolation, onDisqualify]);

  useEffect(() => {
    if (!enabled) return;

    const handleViolation = (type: string, message: string) => {
      setWarnings((prev) => {
        const newWarnings = [...prev, message];
        if (onViolationRef.current) onViolationRef.current(type);
        
        if (newWarnings.length >= maxWarnings) {
          alert(`FINAL WARNING: You have repeatedly violated contest rules.\nYou are being disqualified.`);
          if (onDisqualifyRef.current) onDisqualifyRef.current();
        } else {
          alert(`Warning ${newWarnings.length}/${maxWarnings}: ${message}\n\nThis action is strictly prohibited during the contest. You will be disqualified if you continue.`);
        }
        return newWarnings;
      });
    };

    // 1. Tab Switching Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('TAB_SWITCH', 'Tab switching or minimizing the window is not allowed.');
      }
    };

    // 2. Prevent Copy/Cut/Paste
    const handleClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('CLIPBOARD', 'Copying, cutting, or pasting text is not allowed.');
    };

    // 3. Prevent Inspect Element (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleViolation('INSPECT_ELEMENT', 'Right-clicking is disabled.');
    };

    // 4. Prevent Keyboard Shortcuts for Developer Tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        handleViolation('INSPECT_ELEMENT', 'Opening Developer Tools is not allowed.');
      }

      // Prevent Ctrl+Shift+I / Cmd+Option+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        handleViolation('INSPECT_ELEMENT', 'Opening Developer Tools is not allowed.');
      }

      // Prevent Ctrl+Shift+J / Cmd+Option+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        handleViolation('INSPECT_ELEMENT', 'Opening Developer Tools is not allowed.');
      }

      // Prevent Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        handleViolation('INSPECT_ELEMENT', 'Viewing page source is not allowed.');
      }
    };

    // 5. Prevent Backward Navigation (Soft Block)
    // Push a dummy state so the first 'back' action just pops this state instead of leaving the page
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      handleViolation('BACK_NAVIGATION', 'Using the browser back button is disabled. Please use the on-page navigation if you need to leave.');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((window as any).__allowNavigation) return;
      e.preventDefault();
      e.returnValue = '';
    };

    // Attach all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('paste', handleClipboard);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, maxWarnings]);

  return { warnings };
}
