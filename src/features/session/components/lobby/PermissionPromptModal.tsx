import React from 'react';
import { Modal } from '@/shared/components/ui';

export interface PermissionPromptModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

export const PermissionPromptModal: React.FC<PermissionPromptModalProps> = ({
  isOpen,
  onAllow,
  onDismiss,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onDismiss}
      size="md"
      showCloseButton={false}
      className="max-w-[480px] p-0 overflow-hidden rounded-[28px] border border-slate-200 shadow-2xl bg-white"
    >
      <div className="px-6 pt-8 pb-7 sm:px-8 sm:pt-9 sm:pb-8 flex flex-col items-center text-center select-none bg-white">
        {/* Google Meet style vector illustration */}
        <div className="w-full flex justify-center mb-6">
          <svg
            className="w-64 h-36 mx-auto"
            viewBox="0 0 260 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Baseline table */}
            <line
              x1="20"
              y1="135"
              x2="240"
              y2="135"
              stroke="#202124"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Laptop / Monitor frame */}
            <rect
              x="62"
              y="52"
              width="136"
              height="80"
              rx="4"
              stroke="#202124"
              strokeWidth="1.5"
              fill="#FFFFFF"
            />
            {/* Screen inner bezel */}
            <rect x="66" y="56" width="128" height="68" fill="#F8F9FA" />
            <line
              x1="115"
              y1="132"
              x2="145"
              y2="132"
              stroke="#202124"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Left person (Woman with hair buns) */}
            <g>
              {/* Body */}
              <path
                d="M72 135 C72 120 84 114 98 114 C112 114 122 120 124 135"
                fill="#FFFFFF"
                stroke="#202124"
                strokeWidth="1.5"
              />
              <path
                d="M90 114 L98 124 L106 114"
                stroke="#202124"
                strokeWidth="1.2"
                fill="none"
              />
              {/* Arm reaching for keyboard */}
              <path
                d="M106 123 C114 125 124 130 132 135"
                stroke="#202124"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Head & Neck */}
              <rect x="94" y="105" width="8" height="10" fill="#F8D3C5" />
              <circle
                cx="98"
                cy="97"
                r="10"
                fill="#F8D3C5"
                stroke="#202124"
                strokeWidth="1.5"
              />
              {/* Facial features */}
              <circle cx="101" cy="96" r="1" fill="#202124" />
              <path
                d="M99 101 Q101 103 103 101"
                stroke="#202124"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
              />
              {/* Hair bubbles/buns */}
              <circle cx="88" cy="90" r="5" fill="#202124" />
              <circle cx="82" cy="83" r="5" fill="#202124" />
              <circle cx="75" cy="76" r="5" fill="#202124" />
              <circle cx="70" cy="70" r="4.5" fill="#202124" />
              <path d="M68 68 L64 65 L66 63 Z" fill="#202124" />
              <path
                d="M92 90 C95 86 103 86 107 90"
                stroke="#202124"
                strokeWidth="2.5"
                fill="#202124"
              />
            </g>

            {/* Right person (Man) */}
            <g>
              {/* Body */}
              <path
                d="M136 135 C138 122 148 116 162 116 C176 116 186 122 188 135"
                fill="#FFFFFF"
                stroke="#202124"
                strokeWidth="1.5"
              />
              <path
                d="M154 116 L162 125 L170 116"
                stroke="#202124"
                strokeWidth="1.2"
                fill="none"
              />
              {/* Head & Neck */}
              <rect x="158" y="106" width="8" height="10" fill="#99381E" />
              <circle
                cx="162"
                cy="96"
                r="10"
                fill="#99381E"
                stroke="#202124"
                strokeWidth="1.5"
              />
              {/* Facial features */}
              <circle cx="160" cy="95" r="1" fill="#FFFFFF" />
              <path
                d="M159 100 Q161 102 163 100"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
              />
              {/* Hair */}
              <path
                d="M152 92 C154 84 170 84 172 92 Z"
                fill="#202124"
              />
            </g>

            {/* Blue Camera Bubble */}
            <g transform="translate(108, 14)">
              {/* Sparks/lines */}
              <line
                x1="8"
                y1="10"
                x2="3"
                y2="5"
                stroke="#202124"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="15"
                y1="5"
                x2="15"
                y2="0"
                stroke="#202124"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="22"
                y1="9"
                x2="27"
                y2="4"
                stroke="#202124"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Blue circle */}
              <circle
                cx="20"
                cy="26"
                r="18"
                fill="#1A73E8"
                stroke="#202124"
                strokeWidth="1.5"
              />
              {/* Camera icon */}
              <rect x="11" y="21" width="13" height="10" rx="2" fill="#FFFFFF" />
              <path d="M24 23.5 L29 20.5 L29 31.5 L24 28.5 Z" fill="#FFFFFF" />
            </g>

            {/* Coral/Red Microphone Bubble */}
            <g transform="translate(142, 14)">
              {/* Coral rounded rect */}
              <rect
                x="0"
                y="8"
                width="36"
                height="36"
                rx="14"
                fill="#F26659"
                stroke="#202124"
                strokeWidth="1.5"
              />
              {/* White mic */}
              <rect x="15" y="15" width="6" height="11" rx="3" fill="#FFFFFF" />
              <path
                d="M13 22 C13 26 23 26 23 22"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              <line
                x1="18"
                y1="26"
                x2="18"
                y2="31"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="15"
                y1="31"
                x2="21"
                y2="31"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* Modal Headline */}
        <h3 className="text-xl sm:text-2xl font-normal text-slate-800 tracking-tight leading-snug max-w-sm mb-3">
          Bạn có muốn người khác nhìn thấy và nghe thấy bạn trong cuộc họp không?
        </h3>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-md mb-8">
          Bạn có thể tắt micrô và máy ảnh bất cứ khi nào bạn muốn.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onAllow}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            Cho phép sử dụng micrô và máy ảnh
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="text-xs sm:text-sm font-semibold text-[#0b57d0] hover:text-[#0842a0] hover:underline pt-1 cursor-pointer transition-colors"
          >
            Tiếp tục mà không sử dụng micrô và máy ảnh
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PermissionPromptModal;
