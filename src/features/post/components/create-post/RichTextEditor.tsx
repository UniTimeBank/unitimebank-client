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
  error?: string;
}

const APPLE_EMOJIS = [
  { char: '🎯', code: '1f3af', name: 'Mục tiêu' },
  { char: '💡', code: '1f4a1', name: 'Ý tưởng' },
  { char: '🚀', code: '1f680', name: 'Tên lửa' },
  { char: '⚡', code: '26a1', name: 'Tia chớp' },
  { char: '✨', code: '2728', name: 'Lấp lánh' },
  { char: '📚', code: '1f4da', name: 'Sách' },
  { char: '🎓', code: '1f393', name: 'Tốt nghiệp' },
  { char: '💻', code: '1f4bb', name: 'Laptop' },
  { char: '📝', code: '1f4dd', name: 'Ghi chú' },
  { char: '📌', code: '1f4cc', name: 'Đính ghim' },
  { char: '🔥', code: '1f525', name: 'Nhiệt huyết' },
  { char: '✅', code: '2705', name: 'Hoàn thành' },
  { char: '🌟', code: '1f31f', name: 'Ngôi sao' },
  { char: '🤝', code: '1f91d', name: 'Hợp tác' },
  { char: '👍', code: '1f44d', name: 'Thích' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Nhập nội dung mô tả chi tiết tại đây...',
  minHeight = '140px',
  error,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const emojiPopoverRef = useRef<HTMLDivElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // Track Ctrl/Cmd key state for cursor pointer feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Close emoji popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        emojiPopoverRef.current &&
        !emojiPopoverRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleLinkButtonClick = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const selectedText = sel.toString().trim();

    // If selection is inside an existing <a>, unlink it (Toggle link off)
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }
    const existingAnchor = (node as HTMLElement)?.closest?.('a');
    if (existingAnchor) {
      editorRef.current?.focus();
      document.execCommand('unlink', false);
      onChange(editorRef.current?.innerHTML || '');
      return;
    }

    if (selectedText) {
      // Auto-format URL
      let href = selectedText;
      if (!href.startsWith('http://') && !href.startsWith('https://')) {
        href = `https://${href}`;
      }

      editorRef.current?.focus();
      document.execCommand('createLink', false, href);

      // Clear selection highlight so the user immediately sees the colored link
      const currentSel = window.getSelection();
      if (currentSel) {
        currentSel.collapseToEnd();
      }

      onChange(editorRef.current?.innerHTML || '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      handleLinkButtonClick();
    }
  };

  // Ensure hover tooltip is available for links
  const handleEditorMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && !anchor.title) {
      anchor.title = 'Nhấn giữ Ctrl và nhấp chuột để mở liên kết';
    }
  };

  // Allow Ctrl+Click or Cmd+Click on links inside editor to open in new tab
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.open(anchor.href, '_blank', 'noopener,noreferrer');
    }
  };

  const isEmpty = !value || value === '<br>' || value === '<div><br></div>' || value.trim() === '';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
          {typeof label === 'string' && label.includes('*') ? (
            <>
              {label.replace(/\s*\*/, '')} <span className="text-red-500">*</span>
            </>
          ) : (
            label
          )}
        </label>
      )}

      <div
        className={`bg-white border rounded-2xl overflow-hidden transition-all relative ${
          error
            ? 'border-red-500 ring-2 ring-red-100 shadow-xs'
            : isFocused
            ? 'border-primary-500 ring-2 ring-primary-100 shadow-xs'
            : 'border-gray-200'
        }`}
      >
        {/* Editor Toolbar matching screenshot design */}
        <div className="border-b border-gray-100 bg-white px-3 py-2 flex items-center gap-1 sm:gap-2 flex-wrap text-gray-600 select-none">
          {/* Bold */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors font-bold text-sm cursor-pointer"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors italic text-sm cursor-pointer"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors underline text-sm cursor-pointer"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors line-through text-sm cursor-pointer"
            title="Gạch ngang"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-gray-200 mx-1" />

          {/* Emoji Picker Button */}
          <div className="relative" ref={emojiPopoverRef}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowEmojiPicker((prev) => !prev);
              }}
              className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                showEmojiPicker ? 'bg-teal-50 text-teal-600' : 'hover:text-gray-900'
              }`}
              title="Chèn biểu tượng cảm xúc"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Emoji Quick Popover (Apple iOS style) */}
            {showEmojiPicker && (
              <div
                className="absolute top-full left-0 mt-2 p-2 bg-white/95 backdrop-blur-sm border border-gray-200/90 rounded-2xl shadow-xl z-30 w-52 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-5 gap-1">
                  {APPLE_EMOJIS.map((emoji) => (
                    <button
                      key={emoji.code}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertEmoji(emoji.char)}
                      title={emoji.name}
                      className="w-9 h-9 rounded-xl hover:bg-gray-100 active:scale-90 flex items-center justify-center transition-all cursor-pointer select-none"
                    >
                      <img
                        src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${emoji.code}.png`}
                        alt={emoji.char}
                        className="w-5 h-5 object-contain pointer-events-none select-none"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to text character if image fails to load
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) {
                            (e.target as HTMLElement).style.display = 'none';
                            parent.textContent = emoji.char;
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Direct Link Button (Gmail style) */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLinkButtonClick}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            title="Chuyển đổi liên kết (Ctrl+K)"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-gray-200 mx-1" />

          {/* Unordered List */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            title="Danh sách dấu chấm"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Ordered List */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
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
            onKeyDown={handleKeyDown}
            onClick={handleEditorClick}
            onMouseMove={handleEditorMouseMove}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
            }}
            style={{ minHeight }}
            className={`p-3.5 text-sm text-gray-900 outline-none leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-a:text-teal-600 prose-a:underline prose-a:font-semibold hover:prose-a:text-teal-700 [&_a]:text-teal-600 [&_a]:underline [&_a]:font-semibold [&_a]:hover:text-teal-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_li]:leading-normal ${
              isCtrlPressed ? '[&_a]:cursor-pointer [&_a]:text-teal-800' : ''
            }`}
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

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
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
        className={`prose prose-sm max-w-none text-gray-700 prose-p:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_a]:text-teal-600 [&_a]:underline [&_a]:font-semibold hover:[&_a]:text-teal-700 ${className}`}
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
