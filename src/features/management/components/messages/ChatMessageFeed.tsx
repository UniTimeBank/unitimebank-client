import React, { useState, type RefObject } from 'react';
import {
  MessageSquare,
  Check,
  CheckCheck,
  FileText,
  FileCode,
  FileArchive,
  Download,
  ExternalLink,
  Video,
  File,
  X,
} from 'lucide-react';
import type { BookingItem, BookingMessage } from '@/core/api/booking/bookingApi';
import type { PartnerInfo } from '../../hooks/useMessagesManagement';
import LogoImage from '@/assets/images/Logo.png';

interface ChatMessageFeedProps {
  activeBooking: BookingItem;
  partner: PartnerInfo;
  currentUserId?: string;
  messages: BookingMessage[];
  isLoading: boolean;
  isPartnerTyping: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
}

export const ChatMessageFeed: React.FC<ChatMessageFeedProps> = ({
  partner,
  currentUserId,
  messages,
  isLoading,
  isPartnerTyping,
  containerRef,
}) => {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name?: string } | null>(null);

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const isDifferentDay = (d1: string, d2?: string) => {
    if (!d2) return true;
    const date1 = new Date(d1).toDateString();
    const date2 = new Date(d2).toDateString();
    return date1 !== date2;
  };

  const formatDividerDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      if (isToday) return 'Hôm nay';
      if (isYesterday) return 'Hôm qua';

      return `${d.toLocaleDateString('vi-VN', { weekday: 'long' })}, ${String(d.getDate()).padStart(
        2,
        '0',
      )}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return 'Hôm nay';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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

  const formatFileName = (rawName?: string) => {
    if (!rawName) return 'Tài liệu đính kèm';
    let str = rawName;
    try {
      // Decode single or double UTF-8 as Latin1 mojibake for backward compatibility
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

  const renderMessageContent = (msg: BookingMessage, isMine: boolean) => {
    const cleanFileName = formatFileName(msg.attachmentName);

    // 1. IMAGE TYPE
    if (msg.type === 'IMAGE' && msg.attachmentUrl) {
      return (
        <div className="space-y-1.5">
          <div
            onClick={() => setLightboxImage({ url: msg.attachmentUrl!, name: cleanFileName })}
            className="cursor-pointer overflow-hidden rounded-xl group relative bg-black/5"
          >
            <img
              src={msg.attachmentUrl}
              alt={cleanFileName || 'Hình ảnh'}
              className="max-h-64 max-w-full rounded-xl object-cover hover:scale-[1.02] transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[11px] font-medium px-2 py-1 rounded-md">
                Phóng to
              </span>
            </div>
          </div>
          {msg.content && msg.content !== 'Hình ảnh đính kèm' && (
            <p className="whitespace-pre-wrap break-words text-xs sm:text-[13px] pt-1">
              {msg.content}
            </p>
          )}
        </div>
      );
    }

    // 2. FILE TYPE (PDF, DOCX, ZIP, CODE, etc.)
    if (msg.type === 'FILE' && msg.attachmentUrl) {
      return (
        <div className="space-y-1.5">
          <a
            href={msg.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={cleanFileName}
            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
              isMine
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/90 text-slate-800'
            }`}
          >
            <div className="p-2 rounded-lg bg-white shadow-2xs">
              {getFileIcon(cleanFileName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate max-w-[200px]">
                {cleanFileName}
              </p>
              <p className={`text-[10px] ${isMine ? 'text-white/80' : 'text-slate-500'}`}>
                {formatFileSize(msg.attachmentSize)}
              </p>
            </div>
            <div className={`p-1.5 rounded-lg ${isMine ? 'bg-white/20' : 'bg-slate-200/60'}`}>
              <Download className="w-4 h-4" />
            </div>
          </a>
          {msg.content && msg.content !== msg.attachmentName && msg.content !== cleanFileName && (
            <p className="whitespace-pre-wrap break-words text-xs sm:text-[13px] pt-1">
              {msg.content}
            </p>
          )}
        </div>
      );
    }

    // 3. LINK TYPE (Simple bold & underlined link)
    if (msg.type === 'LINK') {
      const url = msg.content.trim();
      const targetUrl =
        url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

      return (
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-bold underline underline-offset-2 break-all hover:opacity-80 transition-opacity inline-flex items-center gap-1 ${
            isMine ? 'text-white' : 'text-primary-700'
          }`}
        >
          <span>{msg.content}</span>
        </a>
      );
    }

    // 4. SYSTEM TYPE
    if (msg.type === 'SYSTEM') {
      return (
        <div className="text-center text-[11px] font-medium text-slate-500 italic">
          {msg.content}
        </div>
      );
    }

    // 5. TEXT & EMOJI (Default with auto-linked URLs)
    const urlRegex = /(https?:\/\/[^\s]+|meet\.google\.com\/[^\s]+|zoom\.us\/[^\s]+)/gi;
    const parts = msg.content.split(urlRegex);

    return (
      <p className="whitespace-pre-wrap break-words">
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            const targetUrl =
              part.startsWith('http://') || part.startsWith('https://')
                ? part
                : `https://${part}`;
            return (
              <a
                key={i}
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold underline underline-offset-2 break-all hover:opacity-80 transition-opacity ${
                  isMine ? 'text-white' : 'text-primary-700'
                }`}
              >
                {part}
              </a>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}
      </p>
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 bg-[#F8FAFC] flex flex-col"
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-2 text-gray-400 py-16">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Đang tải tin nhắn...</p>
          </div>
        ) : (
          <>
            {/* Top spacer */}
            <div className="flex-1 min-h-0" />

            {messages.length === 0 ? (
              <div className="min-h-[160px] flex flex-col items-center justify-center text-center space-y-2 my-auto">
                <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 mx-auto shadow-2xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-800">Bắt đầu cuộc trò chuyện</h4>
                <p className="text-[11px] text-gray-500 max-w-sm">
                  Gửi lời chào, ảnh chụp đề bài, tài liệu hoặc link Google Meet trước buổi học.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = currentUserId ? msg.senderId === currentUserId : false;
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;

                const showDateDivider = isDifferentDay(msg.sentAt, prevMsg?.sentAt);

                const isSameSenderAsPrev =
                  prevMsg &&
                  prevMsg.senderId === msg.senderId &&
                  Math.abs(new Date(msg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime()) <
                    5 * 60 * 1000 &&
                  !showDateDivider;

                const isSameSenderAsNext =
                  nextMsg &&
                  nextMsg.senderId === msg.senderId &&
                  Math.abs(new Date(nextMsg.sentAt).getTime() - new Date(msg.sentAt).getTime()) <
                    5 * 60 * 1000 &&
                  !isDifferentDay(nextMsg.sentAt, msg.sentAt);

                const isFirstInCluster = !isSameSenderAsPrev;
                const isLastInCluster = !isSameSenderAsNext;

                if (msg.type === 'SYSTEM') {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <span className="bg-slate-200/70 text-slate-700 text-[11px] font-semibold px-3 py-1 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <React.Fragment key={msg.id}>
                    {/* Centered Date Separator */}
                    {showDateDivider && (
                      <div className="relative flex items-center justify-center my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200/70" />
                        </div>
                        <span className="relative bg-[#F8FAFC] px-3.5 text-[11px] font-semibold text-slate-400">
                          {formatDividerDate(msg.sentAt)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${
                        isFirstInCluster ? 'mt-3.5' : 'mt-1'
                      }`}
                    >
                      {/* Partner Avatar */}
                      {!isMine && (
                        <div className="w-7 shrink-0 flex items-end">
                          {isLastInCluster ? (
                            <img
                              src={msg.senderAvatar || partner.avatar}
                              alt={msg.senderName || partner.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = LogoImage;
                              }}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7" />
                          )}
                        </div>
                      )}

                      <div className="max-w-[78%] sm:max-w-[65%] space-y-0.5">
                        {/* Bubble */}
                        <div
                          className={`px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                            isMine
                              ? `bg-primary-700 text-white ${
                                  isFirstInCluster && isLastInCluster
                                    ? 'rounded-2xl rounded-br-xs'
                                    : isFirstInCluster
                                    ? 'rounded-2xl rounded-br-md'
                                    : isLastInCluster
                                    ? 'rounded-2xl rounded-tr-md rounded-br-xs'
                                    : 'rounded-2xl rounded-r-md'
                                }`
                              : `bg-white text-gray-800 border border-gray-200/80 ${
                                  isFirstInCluster && isLastInCluster
                                    ? 'rounded-2xl rounded-bl-xs'
                                    : isFirstInCluster
                                    ? 'rounded-2xl rounded-bl-md'
                                    : isLastInCluster
                                    ? 'rounded-2xl rounded-tl-md rounded-bl-xs'
                                    : 'rounded-2xl rounded-l-md'
                                }`
                          }`}
                        >
                          {renderMessageContent(msg, isMine)}
                        </div>

                        {/* Timestamp & Delivery Status */}
                        {isLastInCluster && (
                          <div
                            className={`flex items-center gap-1 text-[10px] pt-0.5 ${
                              isMine ? 'justify-end text-slate-400' : 'justify-start text-gray-400 pl-1'
                            }`}
                          >
                            <span>{formatMessageTime(msg.sentAt)}</span>
                            {isMine && (
                              <span
                                className="inline-flex items-center ml-0.5"
                                title={
                                  msg.readAt
                                    ? `Đã xem lúc ${formatMessageTime(msg.readAt)}`
                                    : Date.now() - new Date(msg.sentAt).getTime() < 4000
                                    ? 'Đã gửi'
                                    : 'Đã nhận'
                                }
                              >
                                {msg.readAt ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                ) : Date.now() - new Date(msg.sentAt).getTime() < 4000 ? (
                                  <Check className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}

            {/* Partner Typing Bubble */}
            {isPartnerTyping && (
              <div className="flex items-end gap-2 mt-2 mb-1.5 shrink-0 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = LogoImage;
                  }}
                  className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0 mb-0.5"
                />
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs">
                  <span className="text-[11px] font-medium text-slate-500">
                    {partner.name} đang soạn tin
                  </span>
                  <div className="flex items-center gap-1 ml-0.5">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox Modal for zooming in on full images */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name || 'Ảnh chi tiết'}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            {lightboxImage.name && (
              <p className="text-xs text-white/80 font-medium mt-2">{lightboxImage.name}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
