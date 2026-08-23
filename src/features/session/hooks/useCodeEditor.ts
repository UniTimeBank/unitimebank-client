import { useState, useCallback } from 'react';
import type { CodeEditorPayload } from '../types';

export const useCodeEditor = (onSync?: (payload: CodeEditorPayload) => void) => {
  const [code, setCode] = useState<string>(
    '// Viết code hoặc ghi chú chia sẻ trực tiếp cùng nhau tại đây\nfunction solution() {\n  console.log("Hello from UniTimeBank Classroom!");\n}\nsolution();\n',
  );
  const [language, setLanguage] = useState<string>('javascript');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const updateCode = useCallback(
    (newCode: string) => {
      setCode(newCode);
      if (onSync) onSync({ code: newCode, language });
    },
    [language, onSync],
  );

  const updateLanguage = useCallback(
    (newLang: string) => {
      setLanguage(newLang);
      if (onSync) onSync({ code, language: newLang });
    },
    [code, onSync],
  );

  const handleRemoteUpdate = useCallback((payload: CodeEditorPayload) => {
    if (payload.code !== undefined) setCode(payload.code);
    if (payload.language) setLanguage(payload.language);
  }, []);

  return {
    code,
    language,
    isEditorOpen,
    setIsEditorOpen,
    updateCode,
    updateLanguage,
    handleRemoteUpdate,
  };
};
