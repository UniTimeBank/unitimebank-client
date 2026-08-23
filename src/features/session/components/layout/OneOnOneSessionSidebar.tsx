import React, { useState, useRef, useEffect } from 'react';
import {
  Coins,
  MessageSquare,
  Send,
  Paperclip,
  X,
  FileText,
  Download,
  Loader2,
  Image as ImageIcon,
  FileArchive,
  FileCode,
  File,
} from 'lucide-react';
import type { InRoomChatMessage } from '../../types';
import { useUploadChatAttachmentMutation } from '@/core/api/booking';
import { toast } from '@/shared/utils';

interface OneOnOneSessionSidebarProps {
  remainingTimeFormatted: string; // e.g. "34:34"
  elapsedMinutes: number;
  totalDurationMinutes: number;
  totalCredits: number;
  bookingId?: string;
  currentUserId?: string;
  messages: InRoomChatMessage[];
  onSendMessage: (content: string, attachmentUrl?: string, attachmentName?: string) => void;
}

export const OneOnOneSessionSidebar: React.FC<OneOnOneSessionSidebarProps> = ({
  remainingTimeFormatted,
  elapsedMinutes,
  totalDurationMinutes = 60,
  totalCredits = 60,
  bookingId,
  currentUserId,
  messages = [],
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [uploadAttachment, { isLoading: isUploading }] = useUploadChatAttachmentMutation();

  const progressPercent = Math.min(
    100,
    Math.max(0, (elapsedMinutes / (totalDurationMinutes || 60)) * 100),
  );
  const earnedCredits = Math.round((progressPercent / 100) * totalCredits * 10) / 10;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error('Kích thước tệp không được vượt quá 25MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    let attachmentUrl: string | undefined;
    let attachmentName: string | undefined;

    if (selectedFile && bookingId) {
      try {
        const uploadRes = await uploadAttachment({
          bookingId,
          file: selectedFile,
        }).unwrap();
        attachmentUrl = uploadRes.url;
        attachmentName = uploadRes.name || selectedFile.name;
      } catch (err) {
        console.error('Upload attachment failed:', err);
        toast.error('Không thể tải lên tệp đính kèm. Vui lòng thử lại.');
        return;
      }
    }

    const messageText = inputText.trim();
    onSendMessage(messageText, attachmentUrl, attachmentName);

    setInputText('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to format clean filename without UUID prefixes
  const formatFileName = (rawName?: string) => {
    if (!rawName) return 'Tài liệu đính kèm';
    let str = rawName.replace(/^[0-9a-fA-F-]{36}_/, '');
    try {
      for (let i = 0; i < 2; i++) {
        if (/[\u00C2-\u00C3\u00E1\u00BA\u00BB]/.test(str)) {
          const decoded = decodeURIComponent(escape(str));
          if (decoded && decoded !== str) {
            str = decoded;
          }
        }
      }
    } catch {}
    return str;
  };

  // Helper check if URL or name is an image
  const isImageUrl = (url?: string, name?: string) => {
    const checkStr = `${url || ''} ${name || ''}`;
    return (
      checkStr.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) != null ||
      checkStr.includes('/image/upload/')
    );
  };

  // Helper to get matching icon for file type (same as booking message feed)
  const getFileIcon = (fileName?: string) => {
    const ext = (fileName || '').split('.').pop()?.toLowerCase();
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return <FileArchive className="w-5 h-5 text-amber-500 shrink-0" />;
    }
    if (['py', 'java', 'cpp', 'c', 'cs', 'js', 'ts', 'html', 'css', 'json', 'sql'].includes(ext || '')) {
      return <FileCode className="w-5 h-5 text-purple-500 shrink-0" />;
    }
    if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(ext || '')) {
      return <FileText className="w-5 h-5 text-rose-500 shrink-0" />;
    }
    return <File className="w-5 h-5 text-sky-500 shrink-0" />;
  };

  return (
    <aside className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden select-none shrink-0 h-full">
      {/* ════════════════════════════════════════════════════════════ */}
      {/* CARD 1: THỜI GIAN & TÍN CHỈ (Tiếng Việt 100% - Dữ liệu thực) */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="bg-[#0c1b33] text-white rounded-3xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between shrink-0">
        {/* Top: Header & Credits Badge */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            THỜI GIAN CÒN LẠI
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tổng {totalCredits} Credit</span>
          </div>
        </div>

        {/* Big Countdown Clock */}
        <div className="my-3">
          <div className="text-5xl font-extrabold tracking-tight font-mono text-white">
            {remainingTimeFormatted}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>Đã học {elapsedMinutes} phút</span>
            <span className="text-emerald-400 font-semibold">Tích lũy: {earnedCredits} Credit</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* CARD 2: TRÒ CHUYỆN & GỬI TỆP TRỰC TIẾP */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary-600" />
            <h4 className="text-sm font-bold text-slate-800">Trò chuyện trực tiếp</h4>
          </div>
        </div>

        {/* Messages List / Empty State */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs text-center px-4 py-6 space-y-2 select-none overflow-hidden">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-300">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="font-semibold text-slate-700">Chưa có tin nhắn nào</p>
            <p className="text-[11px] text-slate-400 max-w-[220px] leading-relaxed">
              Gửi tin nhắn hoặc tài liệu để trao đổi cùng nhau trong buổi học!
            </p>
          </div>
        ) : (
          <div className="flex-1 my-2 overflow-y-auto space-y-1.5 pr-1 min-h-0">
            {messages.map((msg, index) => {
              const isMe = msg.senderId === currentUserId;
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

              const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
              const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

              // Process raw content and attachment data
              let displayContent = msg.content || '';
              let effectiveAttachmentUrl = (msg as any).attachmentUrl || (msg as any).fileUrl;
              let effectiveAttachmentName = (msg as any).attachmentName || (msg as any).fileName;

              // Fallback if attachment URL or filename was in content
              if (!effectiveAttachmentUrl) {
                if (
                  displayContent.startsWith('http://') ||
                  displayContent.startsWith('https://') ||
                  displayContent.startsWith('/uploads/')
                ) {
                  effectiveAttachmentUrl = displayContent;
                  effectiveAttachmentName = displayContent.split('/').pop();
                  displayContent = '';
                } else if (displayContent.startsWith('Đã gửi tệp: ')) {
                  effectiveAttachmentName = displayContent.replace('Đã gửi tệp: ', '').trim();
                  displayContent = '';
                }
              } else {
                if (displayContent.startsWith('Đã gửi tệp: ')) {
                  displayContent = '';
                }
              }

              const hasAttachment = Boolean(effectiveAttachmentUrl || effectiveAttachmentName);
              const isImage = isImageUrl(effectiveAttachmentUrl, effectiveAttachmentName);
              const cleanFileName = formatFileName(effectiveAttachmentName);

              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${
                    isFirstInGroup ? 'mt-2.5' : 'mt-0.5'
                  }`}
                >
                  {!isMe && isFirstInGroup && (
                    <span className="text-[10px] font-semibold text-slate-500 mb-1 px-1">
                      {msg.senderName || 'Đối tác'}
                    </span>
                  )}

                  <div
                    className={`max-w-[88%] text-xs shadow-2xs overflow-hidden ${
                      isMe
                        ? 'bg-primary-700 text-white rounded-2xl rounded-br-xs px-3.5 py-2.5'
                        : 'bg-white text-gray-800 border border-gray-200/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5'
                    }`}
                  >
                    {/* Attachment preview / File Card (Styled after booking chat) */}
                    {hasAttachment && (
                      <div className={displayContent ? 'mb-2' : ''}>
                        {isImage && effectiveAttachmentUrl ? (
                          <a
                            href={effectiveAttachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl overflow-hidden group relative bg-black/5"
                          >
                            <img
                              src={effectiveAttachmentUrl}
                              alt={cleanFileName}
                              className="max-h-52 w-full rounded-xl object-cover hover:scale-[1.02] transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-md">
                                Phóng to
                              </span>
                            </div>
                          </a>
                        ) : (
                          <a
                            href={effectiveAttachmentUrl || '#'}
                            target={effectiveAttachmentUrl ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            download={cleanFileName}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                              isMe
                                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/90 text-slate-800'
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-white shadow-2xs">
                              {getFileIcon(cleanFileName)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate max-w-[170px]">
                                {cleanFileName}
                              </p>
                              <p
                                className={`text-[10px] ${
                                  isMe ? 'text-white/80' : 'text-slate-500'
                                }`}
                              >
                                Nhấn để tải về
                              </p>
                            </div>
                            <div
                              className={`p-1.5 rounded-lg ${
                                isMe ? 'bg-white/20' : 'bg-slate-200/60'
                              }`}
                            >
                              <Download className="w-4 h-4" />
                            </div>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Clean Text content */}
                    {displayContent && (
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {displayContent}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  {isLastInGroup && msg.sentAt && (
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                      {new Date(msg.sentAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Attachment Selected Preview */}
        {selectedFile && (
          <div className="mb-2 p-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-700 shrink-0">
            <div className="flex items-center gap-2 truncate">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-primary-600 shrink-0" />
              )}
              <span className="truncate font-medium text-[11px]">{selectedFile.name}</span>
              <span className="text-[10px] text-slate-400 shrink-0">
                ({(selectedFile.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-slate-400 hover:text-rose-500 p-0.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Message & Attachment Input Bar */}
        <form onSubmit={handleSubmit} className="relative pt-1 shrink-0 flex items-center gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
          />

          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Đính kèm tệp hoặc hình ảnh"
            disabled={isUploading}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={isUploading}
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedFile) || isUploading}
              className="absolute right-2.5 top-[10px] text-slate-400 hover:text-primary-600 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
};
export default OneOnOneSessionSidebar;
