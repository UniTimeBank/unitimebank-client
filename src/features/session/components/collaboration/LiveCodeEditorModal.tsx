import React, { useState } from 'react';
import { X, Code, Copy, Check } from 'lucide-react';
import { toast } from '@/shared/utils';

interface LiveCodeEditorModalProps {
  isOpen: boolean;
  code: string;
  language: string;
  onClose: () => void;
  onCodeChange: (newCode: string) => void;
  onLanguageChange: (newLang: string) => void;
}

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'HTML / CSS', value: 'html' },
  { label: 'SQL', value: 'sql' },
];

export const LiveCodeEditorModal: React.FC<LiveCodeEditorModalProps> = ({
  isOpen,
  code,
  language,
  onClose,
  onCodeChange,
  onLanguageChange,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Đã sao chép mã nguồn vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Lỗi khi sao chép mã nguồn.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full h-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Editor Top Bar */}
        <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Code className="w-4 h-4" />
              <span>Trình soạn thảo trực tiếp</span>
            </div>
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Textarea */}
        <div className="flex-1 relative bg-slate-950 p-4 font-mono text-sm">
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full bg-transparent text-emerald-400 placeholder-slate-600 focus:outline-none resize-none leading-relaxed font-mono selection:bg-sky-900 selection:text-white"
            placeholder="// Hãy viết code hoặc dán bài tập vào đây để cùng trao đổi..."
          />
        </div>

        {/* Status Bar */}
        <div className="h-8 px-4 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Ngôn ngữ: {language.toUpperCase()}</span>
          <span>Đồng bộ thời gian thực qua WebSockets</span>
        </div>
      </div>
    </div>
  );
};
