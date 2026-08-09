import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Smile,
  Link as LinkIcon,
  List,
  ListOrdered,
} from 'lucide-react';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const EMOJI_LIST = ['😊', '👍', '💡', '🚀', '📚', '🎓', '🔥', '💻', '✨', '🎯', '📝', '🌟', '❤️', '👏', '✅'];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Nhập nội dung mô tả chi tiết tại đây...',
  minHeight = '140px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Synchronize internal innerHTML with external value prop
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Avoid overwriting when editor is focused to prevent cursor jumping
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, arg);
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // If user cleared everything, reset to empty
      if (html === '<br>' || html === '<div><br></div>') {
        onChange('');
      } else {
        onChange(html);
      }
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    executeCommand('insertText', emoji);
    setShowEmojiPicker(false);
  };

  const handleInsertLink = () => {
    const url = prompt('Nhập đường dẫn URL (ví dụ: https://example.com):');
    if (url) {
      executeCommand('createLink', url.startsWith('http') ? url : `https://${url}`);
    }
  };

  const isEmpty = !value || value === '<br>' || value === '<div><br></div>' || value.trim() === '';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
          {label}
        </label>
      )}

      <div
        className={`bg-white border rounded-2xl overflow-hidden transition-all relative ${
          isFocused ? 'border-primary-500 ring-2 ring-primary-100 shadow-xs' : 'border-gray-200'
        }`}
      >
        {/* Editor Toolbar matching screenshot design */}
        <div className="border-b border-gray-100 bg-white px-3 py-2 flex items-center gap-1 sm:gap-2 flex-wrap text-gray-600 select-none">
          {/* Bold */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors font-bold text-sm"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors italic text-sm"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors underline text-sm"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors line-through text-sm"
            title="Gạch ngang"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-gray-200 mx-1" />

          {/* Emoji Picker Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                showEmojiPicker ? 'bg-teal-50 text-teal-600' : 'hover:text-gray-900'
              }`}
              title="Chèn biểu tượng cảm xúc"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Emoji Quick Popover */}
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-30 grid grid-cols-5 gap-1.5 w-48 animate-in fade-in zoom-in-95 duration-150">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleInsertEmoji(emoji)}
                    className="w-8 h-8 rounded-xl hover:bg-gray-100 text-lg flex items-center justify-center transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Link */}
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Chèn đường dẫn"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-gray-200 mx-1" />

          {/* Unordered List */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Danh sách dấu chấm"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Ordered List */}
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Danh sách đánh số"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* ContentEditable Area */}
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              setShowEmojiPicker(false);
            }}
            style={{ minHeight }}
            className="p-3.5 text-sm text-gray-900 outline-none leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5"
          />

          {/* Placeholder overlay when editor is empty */}
          {isEmpty && !isFocused && (
            <div
              onClick={() => editorRef.current?.focus()}
              className="absolute top-3.5 left-3.5 right-3.5 text-sm text-gray-400 pointer-events-none select-none font-normal"
            >
              {placeholder}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface RichTextViewerProps {
  content: string;
  className?: string;
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Check if content contains HTML tags
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className={`prose prose-sm max-w-none text-gray-700 prose-p:my-1 prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4 prose-a:text-teal-600 prose-a:underline ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Plaintext rendering with line breaks
  return (
    <div className={`whitespace-pre-line text-gray-700 text-sm leading-relaxed ${className}`}>
      {content}
    </div>
  );
};
