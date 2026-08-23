import React, { useRef, type RefObject } from 'react';
import { Send, Lock, Paperclip, ImageIcon, Smile, X, File, FileText, FileArchive, FileCode, Loader2 } from 'lucide-react';

interface PendingAttachment {
  file: File;
  previewUrl?: string;
  type: 'IMAGE' | 'FILE';
  name: string;
  size: number;
}

interface ChatInputBarProps {
  inputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: React.FormEvent) => void;
  isSending: boolean;
  isUploading: boolean;
  isReadOnly: boolean;
  readOnlyNotice: string;
  partnerName: string;
  inputRef: RefObject<HTMLInputElement | null>;
  pendingAttachment: PendingAttachment | null;
  onSelectFile: (file: File) => void;
  onRemoveAttachment: () => void;
  isEmojiPickerOpen: boolean;
  onToggleEmojiPicker: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😊', '🎉', '📚', '💻', '🙏', '🚀', '💡', '👏', '🔥', '✅', '👋', '☕', '🎯', '💯'];

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputText,
  onInputChange,
  onSend,
  isSending,
  isUploading,
  isReadOnly,
  readOnlyNotice,
  partnerName,
  inputRef,
  pendingAttachment,
  onSelectFile,
  onRemoveAttachment,
  isEmojiPickerOpen,
  onToggleEmojiPicker,
  onEmojiSelect,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName?: string) => {
    const ext = (fileName || '').split('.').pop()?.toLowerCase();
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return <FileArchive className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    if (['py', 'java', 'cpp', 'c', 'cs', 'js', 'ts', 'html', 'css', 'json', 'sql'].includes(ext || '')) {
      return <FileCode className="w-4 h-4 text-purple-500 shrink-0" />;
    }
    if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(ext || '')) {
      return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
    }
    return <File className="w-4 h-4 text-sky-500 shrink-0" />;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectFile(file);
    }
    e.target.value = '';
  };

  if (isReadOnly) {
    return (
      <div className="p-4 bg-slate-100/90 border-t border-slate-200 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium text-center shrink-0">
        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
        <span>{readOnlyNotice}</span>
      </div>
    );
  }

  const isBusy = isSending || isUploading;
  const canSubmit = (Boolean(inputText.trim()) || Boolean(pendingAttachment)) && !isBusy;

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0 relative">
      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.7z,.py,.java,.cpp,.c,.cs,.js,.ts,.html,.css,.json,.sql"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Quick Emoji Picker Popover */}
      {isEmojiPickerOpen && (
        <div className="absolute bottom-full left-4 mb-2 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 flex items-center gap-1 flex-wrap max-w-[280px] animate-in fade-in zoom-in-95 duration-150">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onEmojiSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-base hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Pending Attachment Preview Bar */}
      {pendingAttachment && (
        <div className="mb-2 p-2 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="flex items-center gap-2.5 min-w-0">
            {pendingAttachment.previewUrl ? (
              <img
                src={pendingAttachment.previewUrl}
                alt="Preview"
                className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0">
                {getFileIcon(pendingAttachment.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[240px] sm:max-w-xs">
                {pendingAttachment.name}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {formatFileSize(pendingAttachment.size)} • Sẵn sàng gửi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveAttachment}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="Hủy tệp đính kèm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={onSend}
        className="flex items-center gap-2 bg-gray-50/90 border border-gray-200/90 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all"
      >
        {/* Attachment & Emoji Buttons */}
        <div className="flex items-center gap-0.5 px-1 shrink-0 text-gray-400">
          <button
            type="button"
            title="Đính kèm tài liệu / bài tập (.pdf, .docx, .zip, .cpp...)"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Gửi hình ảnh (.png, .jpg, .webp)"
            onClick={() => imageInputRef.current?.click()}
            className="p-1.5 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Biểu tượng cảm xúc"
            onClick={onToggleEmojiPicker}
            className={`p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer ${
              isEmojiPickerOpen ? 'bg-primary-50 text-primary-700' : 'hover:text-gray-600'
            }`}
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={onInputChange}
          placeholder={
            pendingAttachment
              ? 'Nhập lời nhắn kèm theo tệp (tùy chọn)...'
              : `Nhập tin nhắn gửi đến ${partnerName}...`
          }
          className="h-full flex-1 bg-transparent border-0 text-xs sm:text-sm font-normal placeholder:text-gray-400 focus:outline-none px-1 text-gray-800"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-primary-700 hover:bg-primary-800 text-white shadow-xs disabled:opacity-30 shrink-0 cursor-pointer transition-all"
          title={isUploading ? 'Đang tải tệp lên...' : 'Gửi tin nhắn'}
        >
          {isBusy ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </div>
  );
};
