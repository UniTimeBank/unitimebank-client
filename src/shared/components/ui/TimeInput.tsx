import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

export interface TimeInputProps {
  label?: string;
  value: string; // "HH:mm" format e.g. "19:00"
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

const BASE_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const BASE_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// Loop array 3 times for infinite scrolling effect
const INFINITE_HOURS = [...BASE_HOURS, ...BASE_HOURS, ...BASE_HOURS];
const INFINITE_MINUTES = [...BASE_MINUTES, ...BASE_MINUTES, ...BASE_MINUTES];

const ITEM_HEIGHT = 40; // 40px per item

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentHour, currentMinute] = (value || '19:00').split(':');

  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  // Mouse Drag state
  const isDraggingHour = useRef(false);
  const startYHour = useRef(0);
  const startScrollHour = useRef(0);

  const isDraggingMin = useRef(false);
  const startYMin = useRef(0);
  const startScrollMin = useRef(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 260);
    }
    setIsOpen(!isOpen);
  };

  // Cuộn tới vị trí đúng trong tập dữ liệu giữa (Middle Set)
  const scrollToHourValue = (hVal: string, smooth = true) => {
    if (!hourListRef.current) return;
    const baseIndex = BASE_HOURS.indexOf(hVal);
    if (baseIndex >= 0) {
      const targetIndex = 24 + baseIndex; // Middle set offset
      hourListRef.current.scrollTo({
        top: targetIndex * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  const scrollToMinuteValue = (mVal: string, smooth = true) => {
    if (!minuteListRef.current) return;
    const baseIndex = BASE_MINUTES.indexOf(mVal);
    if (baseIndex >= 0) {
      const targetIndex = 60 + baseIndex; // Middle set offset
      minuteListRef.current.scrollTo({
        top: targetIndex * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // When opened, scroll to middle set value
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToHourValue(currentHour, false);
        scrollToMinuteValue(currentMinute, false);
      }, 50);
    }
  }, [isOpen]);

  // Infinite Scroll Repositioning for Hours
  const handleHourScroll = () => {
    if (!hourListRef.current) return;
    const scrollTop = hourListRef.current.scrollTop;
    const totalItems = INFINITE_HOURS.length;
    const singleSetHeight = 24 * ITEM_HEIGHT;

    // Reset position if reaching boundaries
    if (scrollTop < ITEM_HEIGHT * 2) {
      hourListRef.current.scrollTop += singleSetHeight;
    } else if (scrollTop > ITEM_HEIGHT * (totalItems - 5)) {
      hourListRef.current.scrollTop -= singleSetHeight;
    }

    const index = Math.min(
      totalItems - 1,
      Math.max(0, Math.round(hourListRef.current.scrollTop / ITEM_HEIGHT)),
    );
    const newHour = BASE_HOURS[index % 24];
    if (newHour && newHour !== currentHour) {
      onChange(`${newHour}:${currentMinute || '00'}`);
    }
  };

  // Infinite Scroll Repositioning for Minutes
  const handleMinuteScroll = () => {
    if (!minuteListRef.current) return;
    const scrollTop = minuteListRef.current.scrollTop;
    const totalItems = INFINITE_MINUTES.length;
    const singleSetHeight = 60 * ITEM_HEIGHT;

    // Reset position if reaching boundaries
    if (scrollTop < ITEM_HEIGHT * 2) {
      minuteListRef.current.scrollTop += singleSetHeight;
    } else if (scrollTop > ITEM_HEIGHT * (totalItems - 5)) {
      minuteListRef.current.scrollTop -= singleSetHeight;
    }

    const index = Math.min(
      totalItems - 1,
      Math.max(0, Math.round(minuteListRef.current.scrollTop / ITEM_HEIGHT)),
    );
    const newMinute = BASE_MINUTES[index % 60];
    if (newMinute && newMinute !== currentMinute) {
      onChange(`${currentHour || '09'}:${newMinute}`);
    }
  };

  const handleSelectHour = (hVal: string) => {
    onChange(`${hVal}:${currentMinute || '00'}`);
    scrollToHourValue(hVal, true);
  };

  const handleSelectMinute = (mVal: string) => {
    onChange(`${currentHour || '09'}:${mVal}`);
    scrollToMinuteValue(mVal, true);
  };

  // Drag handlers for Hours column
  const handleHourMouseDown = (e: React.MouseEvent) => {
    isDraggingHour.current = true;
    startYHour.current = e.pageY;
    if (hourListRef.current) {
      startScrollHour.current = hourListRef.current.scrollTop;
    }
  };

  const handleHourMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingHour.current || !hourListRef.current) return;
    e.preventDefault();
    const deltaY = e.pageY - startYHour.current;
    hourListRef.current.scrollTop = startScrollHour.current - deltaY;
  };

  const handleHourMouseUp = () => {
    if (isDraggingHour.current) {
      isDraggingHour.current = false;
      handleHourScroll();
    }
  };

  // Drag handlers for Minutes column
  const handleMinMouseDown = (e: React.MouseEvent) => {
    isDraggingMin.current = true;
    startYMin.current = e.pageY;
    if (minuteListRef.current) {
      startScrollMin.current = minuteListRef.current.scrollTop;
    }
  };

  const handleMinMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMin.current || !minuteListRef.current) return;
    e.preventDefault();
    const deltaY = e.pageY - startYMin.current;
    minuteListRef.current.scrollTop = startScrollMin.current - deltaY;
  };

  const handleMinMouseUp = () => {
    if (isDraggingMin.current) {
      isDraggingMin.current = false;
      handleMinuteScroll();
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* Input Display Box */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm flex items-center justify-between bg-white transition-all duration-200 outline-none cursor-pointer ${
          isOpen
            ? 'border-primary-500 ring-2 ring-primary-100'
            : 'border-gray-200 hover:border-gray-300'
        } ${error ? 'border-red-500 ring-2 ring-red-100' : ''}`}
      >
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-primary-500 shrink-0" />
          <span className="font-extrabold text-slate-800 text-sm tracking-wide">
            {value || '19:00'}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary-500' : ''
          }`}
        />
      </button>

      {/* iOS Infinite Drum Wheel Selector Popup */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-4 animate-in zoom-in-95 duration-150 min-w-[240px] ${
            openUpward ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
          }`}
        >
          {/* Header Column Titles */}
          <div className="grid grid-cols-2 text-center pb-2 mb-2 border-b border-slate-100">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              GIỜ
            </span>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-l border-slate-100">
              PHÚT
            </span>
          </div>

          {/* iOS Drum Wheel Container */}
          <div className="relative grid grid-cols-2 gap-2 h-[160px] select-none overflow-hidden">
            {/* Center Drum Highlight Bar */}
            <div className="absolute top-[60px] left-0 right-0 h-10 bg-primary-50/90 border-2 border-primary-500/80 pointer-events-none rounded-xl" />

            {/* Hours Column (Infinite Loop) */}
            <div
              ref={hourListRef}
              onScroll={handleHourScroll}
              onMouseDown={handleHourMouseDown}
              onMouseMove={handleHourMouseMove}
              onMouseUp={handleHourMouseUp}
              onMouseLeave={handleHourMouseUp}
              className="overflow-y-auto py-[60px] space-y-0 text-center snap-y snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {INFINITE_HOURS.map((h, idx) => {
                const isSelected = h === currentHour;
                return (
                  <button
                    key={`h-${idx}`}
                    type="button"
                    onClick={() => handleSelectHour(h)}
                    className={`w-full h-10 snap-center flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'text-primary-700 font-black text-base scale-110 opacity-100'
                        : 'text-slate-400 font-semibold text-xs opacity-40 hover:opacity-80 hover:text-slate-800'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minutes Column (Infinite Loop) */}
            <div
              ref={minuteListRef}
              onScroll={handleMinuteScroll}
              onMouseDown={handleMinMouseDown}
              onMouseMove={handleMinMouseMove}
              onMouseUp={handleMinMouseUp}
              onMouseLeave={handleMinMouseUp}
              className="overflow-y-auto py-[60px] space-y-0 text-center border-l border-slate-100 snap-y snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {INFINITE_MINUTES.map((m, idx) => {
                const isSelected = m === currentMinute;
                return (
                  <button
                    key={`m-${idx}`}
                    type="button"
                    onClick={() => handleSelectMinute(m)}
                    className={`w-full h-10 snap-center flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'text-primary-700 font-black text-base scale-110 opacity-100'
                        : 'text-slate-400 font-semibold text-xs opacity-40 hover:opacity-80 hover:text-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
