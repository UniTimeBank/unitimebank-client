import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Clock } from 'lucide-react';

export interface DisabledTimeInterval {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface TimeInputProps {
  label?: string;
  value: string; // "HH:mm" format e.g. "19:00"
  onChange: (value: string) => void;
  minTime?: string; // Giờ tối thiểu cho phép chọn (e.g. "08:00")
  maxTime?: string; // Giờ tối đa cho phép chọn (e.g. "22:00")
  disabledIntervals?: DisabledTimeInterval[]; // Danh sách các khung giờ bận/đã có lịch
  error?: string;
  className?: string;
}

const ALL_BASE_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const ALL_BASE_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const ITEM_HEIGHT = 40; // Đúng 40px mỗi mục
const CONTAINER_HEIGHT = 200; // 5 * 40px = 200px (5 hàng hiển thị)
const CENTER_OFFSET = 80; // Tâm ở 80px (2 * 40px)

const format24Hour = (time24: string) => {
  if (!time24) return '19:00';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value = '19:00',
  onChange,
  minTime,
  maxTime,
  disabledIntervals = [],
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [propHour, propMinute] = (value || '19:00').split(':');
  const [activeHour, setActiveHour] = useState(propHour || '19');
  const [activeMinute, setActiveMinute] = useState(propMinute || '00');

  // Dùng Ref để lưu giá trị mới nhất, tránh closure cũ khi cuộn nhanh
  const latestHourRef = useRef(activeHour);
  const latestMinRef = useRef(activeMinute);

  useEffect(() => {
    latestHourRef.current = activeHour;
  }, [activeHour]);

  useEffect(() => {
    latestMinRef.current = activeMinute;
  }, [activeMinute]);

  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  // Kiểm tra riêng cho GIỜ: Giờ chỉ bị khóa nếu toàn bộ các phút trong giờ đó không thể chọn
  const isHourBlocked = useCallback(
    (hStr: string) => {
      const h = parseInt(hStr, 10);

      if (minTime) {
        const [minHStr, minMStr] = minTime.split(':');
        const minH = parseInt(minHStr, 10);
        const minM = parseInt(minMStr, 10);
        // Nếu giờ nhỏ hơn giờ bắt đầu -> Khóa
        if (h < minH) return true;
        // Nếu giờ bằng giờ bắt đầu nhưng phút bắt đầu là 59 -> Khóa
        if (h === minH && minM >= 59) return true;
      }

      if (maxTime) {
        const [maxHStr, maxMStr] = maxTime.split(':');
        const maxH = parseInt(maxHStr, 10);
        const maxM = parseInt(maxMStr, 10);
        // Nếu giờ lớn hơn giờ kết thúc tối đa -> Khóa
        if (h > maxH) return true;
        // Nếu giờ bằng giờ tối đa nhưng phút tối đa là 00 -> Khóa
        if (h === maxH && maxM === 0) return true;
      }

      // Nếu toàn bộ 60 phút trong giờ này bị bao trọn bởi lịch bận -> Khóa
      if (disabledIntervals && disabledIntervals.length > 0) {
        const allMinutesBlocked = disabledIntervals.some(
          (inv) => inv.startTime <= `${hStr}:00` && `${hStr}:59` < inv.endTime,
        );
        if (allMinutesBlocked) return true;
      }

      return false;
    },
    [minTime, maxTime, disabledIntervals],
  );

  // Kiểm tra riêng cho PHÚT: Kết hợp với activeHour hiện tại
  const isMinuteBlocked = useCallback(
    (mStr: string) => {
      const timeStr = `${activeHour}:${mStr}`;

      if (minTime && timeStr <= minTime) return true;
      if (maxTime && timeStr >= maxTime) return true;

      if (disabledIntervals && disabledIntervals.length > 0) {
        return disabledIntervals.some(
          (inv) => inv.startTime <= timeStr && timeStr < inv.endTime,
        );
      }

      return false;
    },
    [activeHour, minTime, maxTime, disabledIntervals],
  );

  // Kiểm tra xem giá trị hiện tại có bị trùng/bận không
  const isCurrentValueBlocked = useCallback(
    (val: string) => {
      if (minTime && val <= minTime) return true;
      if (maxTime && val >= maxTime) return true;
      if (disabledIntervals && disabledIntervals.length > 0) {
        return disabledIntervals.some(
          (inv) => inv.startTime <= val && val < inv.endTime,
        );
      }
      return false;
    },
    [minTime, maxTime, disabledIntervals],
  );

  // Luôn luôn hiển thị đầy đủ 24 giờ (00 -> 23) và 60 phút (00 -> 59), không bao giờ ẩn số nào
  const availableHours = ALL_BASE_HOURS;
  const availableMinutes = ALL_BASE_MINUTES;

  // Tạo mảng lặp vô tận (7 chu kỳ)
  const infiniteHours = useMemo(() => {
    return [
      ...availableHours,
      ...availableHours,
      ...availableHours,
      ...availableHours,
      ...availableHours,
      ...availableHours,
      ...availableHours,
    ];
  }, [availableHours]);

  const infiniteMinutes = useMemo(() => {
    return [
      ...availableMinutes,
      ...availableMinutes,
      ...availableMinutes,
      ...availableMinutes,
      ...availableMinutes,
      ...availableMinutes,
      ...availableMinutes,
    ];
  }, [availableMinutes]);

  // Mouse Drag state
  const isDraggingHour = useRef(false);
  const startYHour = useRef(0);
  const startScrollHour = useRef(0);

  const isDraggingMin = useRef(false);
  const startYMin = useRef(0);
  const startScrollMin = useRef(0);

  // Đồng bộ giá trị prop từ ngoài vào state nội bộ
  useEffect(() => {
    const [h, m] = (value || '19:00').split(':');
    if (h) {
      setActiveHour(h);
      latestHourRef.current = h;
    }
    if (m) {
      setActiveMinute(m);
      latestMinRef.current = m;
    }
  }, [value]);

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
      setOpenUpward(spaceBelow < 300);
    }
    setIsOpen(!isOpen);
  };

  // Định vị chu kỳ giữa (3 chu kỳ)
  const jumpToHour = useCallback(
    (hVal: string) => {
      if (!hourListRef.current) return;
      let baseIndex = availableHours.indexOf(hVal);
      if (baseIndex < 0) baseIndex = 0;
      const targetIndex = availableHours.length * 3 + baseIndex;
      hourListRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
    },
    [availableHours],
  );

  const jumpToMinute = useCallback(
    (mVal: string) => {
      if (!minuteListRef.current) return;
      let baseIndex = availableMinutes.indexOf(mVal);
      if (baseIndex < 0) baseIndex = 0;
      const targetIndex = availableMinutes.length * 3 + baseIndex;
      minuteListRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
    },
    [availableMinutes],
  );

  // Chỉ định vị 1 lần duy nhất khi vừa mở popup
  useEffect(() => {
    if (isOpen) {
      const [h, m] = (value || '19:00').split(':');
      requestAnimationFrame(() => {
        jumpToHour(h || availableHours[0]);
        jumpToMinute(m || availableMinutes[0]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, availableHours, availableMinutes]);

  // Cuộn Giờ: Vòng lặp vô tận
  const handleHourScroll = () => {
    if (!hourListRef.current) return;
    const top = hourListRef.current.scrollTop;
    const cycleHeight = availableHours.length * ITEM_HEIGHT;

    if (top < cycleHeight * 1.5) {
      const remainder = top % cycleHeight;
      hourListRef.current.scrollTop = cycleHeight * 3 + remainder;
      return;
    } else if (top > cycleHeight * 5) {
      const remainder = top % cycleHeight;
      hourListRef.current.scrollTop = cycleHeight * 3 + remainder;
      return;
    }

    const rawIndex = Math.round(top / ITEM_HEIGHT);
    const selectedH = infiniteHours[rawIndex] || availableHours[rawIndex % availableHours.length];
    if (selectedH && selectedH !== latestHourRef.current) {
      setActiveHour(selectedH);
      latestHourRef.current = selectedH;
      onChange(`${selectedH}:${latestMinRef.current || '00'}`);
    }
  };

  // Cuộn Phút: Vòng lặp vô tận
  const handleMinuteScroll = () => {
    if (!minuteListRef.current) return;
    const top = minuteListRef.current.scrollTop;
    const cycleHeight = availableMinutes.length * ITEM_HEIGHT;

    if (top < cycleHeight * 1.5) {
      const remainder = top % cycleHeight;
      minuteListRef.current.scrollTop = cycleHeight * 3 + remainder;
      return;
    } else if (top > cycleHeight * 5) {
      const remainder = top % cycleHeight;
      minuteListRef.current.scrollTop = cycleHeight * 3 + remainder;
      return;
    }

    const rawIndex = Math.round(top / ITEM_HEIGHT);
    const selectedM =
      infiniteMinutes[rawIndex] || availableMinutes[rawIndex % availableMinutes.length];
    if (selectedM && selectedM !== latestMinRef.current) {
      setActiveMinute(selectedM);
      latestMinRef.current = selectedM;
      onChange(`${latestHourRef.current || '19'}:${selectedM}`);
    }
  };

  // BẮT CHÍNH XÁC SỰ KIỆN LĂN CHUỘT THẬT (Non-passive DOM Event Listener): Khóa cứng đúng 40.0px mỗi nấc
  useEffect(() => {
    if (!isOpen) return;
    const hourEl = hourListRef.current;
    const minEl = minuteListRef.current;
    if (!hourEl || !minEl) return;

    const onHourWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.deltaY > 0 ? 1 : -1;
      const current = hourEl.scrollTop;
      const currentIdx = Math.round(current / ITEM_HEIGHT);
      const nextIdx = currentIdx + step;
      hourEl.scrollTop = nextIdx * ITEM_HEIGHT;

      const selectedH = infiniteHours[nextIdx] || availableHours[nextIdx % availableHours.length];
      if (selectedH) {
        setActiveHour(selectedH);
        latestHourRef.current = selectedH;
        onChange(`${selectedH}:${latestMinRef.current || '00'}`);
      }
    };

    const onMinWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.deltaY > 0 ? 1 : -1;
      const current = minEl.scrollTop;
      const currentIdx = Math.round(current / ITEM_HEIGHT);
      const nextIdx = currentIdx + step;
      minEl.scrollTop = nextIdx * ITEM_HEIGHT;

      const selectedM =
        infiniteMinutes[nextIdx] || availableMinutes[nextIdx % availableMinutes.length];
      if (selectedM) {
        setActiveMinute(selectedM);
        latestMinRef.current = selectedM;
        onChange(`${latestHourRef.current || '19'}:${selectedM}`);
      }
    };

    hourEl.addEventListener('wheel', onHourWheel, { passive: false });
    minEl.addEventListener('wheel', onMinWheel, { passive: false });

    return () => {
      hourEl.removeEventListener('wheel', onHourWheel);
      minEl.removeEventListener('wheel', onMinWheel);
    };
  }, [isOpen, onChange, infiniteHours, infiniteMinutes, availableHours, availableMinutes]);

  // Bấm chọn trực tiếp số: Khóa ngay vị trí tâm và gọi onChange đồng bộ cả giờ và phút
  const handleSelectHour = (h: string, idx: number) => {
    setActiveHour(h);
    latestHourRef.current = h;
    onChange(`${h}:${latestMinRef.current || '00'}`);
    if (hourListRef.current) {
      hourListRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  };

  const handleSelectMinute = (m: string, idx: number) => {
    setActiveMinute(m);
    latestMinRef.current = m;
    onChange(`${latestHourRef.current || '19'}:${m}`);
    if (minuteListRef.current) {
      minuteListRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  };

  // Drag handlers cho chuột Giờ
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
    if (isDraggingHour.current && hourListRef.current) {
      isDraggingHour.current = false;
      const top = hourListRef.current.scrollTop;
      const snappedIndex = Math.round(top / ITEM_HEIGHT);
      hourListRef.current.scrollTop = snappedIndex * ITEM_HEIGHT;
      const selectedH = infiniteHours[snappedIndex];
      if (selectedH) {
        setActiveHour(selectedH);
        latestHourRef.current = selectedH;
        onChange(`${selectedH}:${latestMinRef.current || '00'}`);
      }
    }
  };

  // Drag handlers cho chuột Phút
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
    if (isDraggingMin.current && minuteListRef.current) {
      isDraggingMin.current = false;
      const top = minuteListRef.current.scrollTop;
      const snappedIndex = Math.round(top / ITEM_HEIGHT);
      minuteListRef.current.scrollTop = snappedIndex * ITEM_HEIGHT;
      const selectedM = infiniteMinutes[snappedIndex];
      if (selectedM) {
        setActiveMinute(selectedM);
        latestMinRef.current = selectedM;
        onChange(`${latestHourRef.current || '19'}:${selectedM}`);
      }
    }
  };

  const isBlockedValue = isCurrentValueBlocked(value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      {/* Input Display Box (Chỉ đổi màu chữ số và icon sang đỏ khi giờ đang chọn bị bận) */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm flex items-center justify-between bg-white transition-all duration-150 outline-none cursor-pointer ${
          isOpen
            ? 'border-primary-600 ring-2 ring-primary-600/20 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${error ? 'border-red-500 ring-2 ring-red-100' : ''}`}
      >
        <span
          className={`text-sm tracking-wide ${
            isBlockedValue ? 'text-red-500 font-semibold' : 'font-medium text-slate-800'
          }`}
        >
          {format24Hour(value)}
        </span>

        <Clock
          className={`w-4 h-4 shrink-0 ${
            isBlockedValue ? 'text-red-500' : 'text-slate-700'
          }`}
        />
      </button>

      {/* Bảng con lăn Vòng lặp vô tận (5 hàng chuẩn iOS Drum Wheel - Tâm ở 80px) */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-4 min-w-[220px] ${
            openUpward ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
          }`}
        >
          {/* Header Tiêu Đề Cột */}
          <div className="grid grid-cols-2 text-center pb-2 mb-2 border-b border-slate-100 font-medium text-[11px] text-slate-500 uppercase tracking-wider">
            <span>GIỜ</span>
            <span className="border-l border-slate-100">PHÚT</span>
          </div>

          {/* Drum Wheel Container (Cao 200px hiển thị 5 hàng hoàn hảo) */}
          <div
            style={{ height: `${CONTAINER_HEIGHT}px` }}
            className="relative grid grid-cols-2 gap-2 select-none overflow-hidden"
          >
            {/* Khung Highlight cố định ở giữa (Tâm y=80px, Cao 40px) */}
            <div
              style={{ top: `${CENTER_OFFSET}px`, height: `${ITEM_HEIGHT}px` }}
              className="absolute left-0 right-0 bg-primary-50/60 border border-primary-600/60 pointer-events-none rounded-xl z-0"
            />

            {/* Lớp phủ Gradient 3D mềm mại (phủ nhẹ viền trên và dưới, giữ số rõ ràng dễ đọc) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/70 via-white/30 to-transparent z-20" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/70 via-white/30 to-transparent z-20" />

            {/* Cột GIỜ (Hiển thị trọn vẹn 24H từ 00 -> 23, chỉ gạch đỏ các giờ không thể chọn) */}
            <div
              ref={hourListRef}
              onScroll={handleHourScroll}
              onMouseDown={handleHourMouseDown}
              onMouseMove={handleHourMouseMove}
              onMouseUp={handleHourMouseUp}
              onMouseLeave={handleHourMouseUp}
              className="relative z-10 overflow-y-auto space-y-0 text-center cursor-grab active:cursor-grabbing [overscroll-behavior:contain] [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {/* Spacer trên đúng 80.0px để item 0 rơi đúng vào tâm y=80px */}
              <div
                style={{
                  height: `${CENTER_OFFSET}px`,
                  minHeight: `${CENTER_OFFSET}px`,
                  maxHeight: `${CENTER_OFFSET}px`,
                }}
                className="shrink-0 pointer-events-none"
              />

              {infiniteHours.map((h, idx) => {
                const isCenter = h === activeHour;
                const isBlocked = isHourBlocked(h);

                return (
                  <button
                    key={`h-${idx}`}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => !isBlocked && handleSelectHour(h, idx)}
                    style={{
                      height: `${ITEM_HEIGHT}px`,
                      minHeight: `${ITEM_HEIGHT}px`,
                      maxHeight: `${ITEM_HEIGHT}px`,
                      lineHeight: `${ITEM_HEIGHT}px`,
                      boxSizing: 'border-box',
                    }}
                    className={`w-full flex items-center justify-center rounded-lg transition-colors duration-75 text-sm font-normal ${
                      isBlocked
                        ? 'text-red-400 line-through decoration-red-300 cursor-not-allowed pointer-events-none select-none'
                        : isCenter
                        ? 'text-slate-950 font-medium'
                        : 'text-slate-500 hover:text-slate-700 cursor-pointer'
                    }`}
                  >
                    <span>{h}</span>
                  </button>
                );
              })}

              {/* Spacer dưới đúng 80.0px */}
              <div
                style={{
                  height: `${CENTER_OFFSET}px`,
                  minHeight: `${CENTER_OFFSET}px`,
                  maxHeight: `${CENTER_OFFSET}px`,
                }}
                className="shrink-0 pointer-events-none"
              />
            </div>

            {/* Cột PHÚT (Hiển thị trọn vẹn 60 phút từ 00 -> 59, chỉ gạch đỏ các phút không thể chọn) */}
            <div
              ref={minuteListRef}
              onScroll={handleMinuteScroll}
              onMouseDown={handleMinMouseDown}
              onMouseMove={handleMinMouseMove}
              onMouseUp={handleMinMouseUp}
              onMouseLeave={handleMinMouseUp}
              className="relative z-10 overflow-y-auto space-y-0 text-center border-l border-slate-100 cursor-grab active:cursor-grabbing [overscroll-behavior:contain] [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {/* Spacer trên đúng 80.0px */}
              <div
                style={{
                  height: `${CENTER_OFFSET}px`,
                  minHeight: `${CENTER_OFFSET}px`,
                  maxHeight: `${CENTER_OFFSET}px`,
                }}
                className="shrink-0 pointer-events-none"
              />

              {infiniteMinutes.map((m, idx) => {
                const isCenter = m === activeMinute;
                const isBlocked = isMinuteBlocked(m);

                return (
                  <button
                    key={`m-${idx}`}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => !isBlocked && handleSelectMinute(m, idx)}
                    style={{
                      height: `${ITEM_HEIGHT}px`,
                      minHeight: `${ITEM_HEIGHT}px`,
                      maxHeight: `${ITEM_HEIGHT}px`,
                      lineHeight: `${ITEM_HEIGHT}px`,
                      boxSizing: 'border-box',
                    }}
                    className={`w-full flex items-center justify-center rounded-lg transition-colors duration-75 text-sm font-normal ${
                      isBlocked
                        ? 'text-red-400 line-through decoration-red-300 cursor-not-allowed pointer-events-none select-none'
                        : isCenter
                        ? 'text-slate-950 font-medium'
                        : 'text-slate-500 hover:text-slate-700 cursor-pointer'
                    }`}
                  >
                    <span>{m}</span>
                  </button>
                );
              })}

              {/* Spacer dưới đúng 80.0px */}
              <div
                style={{
                  height: `${CENTER_OFFSET}px`,
                  minHeight: `${CENTER_OFFSET}px`,
                  maxHeight: `${CENTER_OFFSET}px`,
                }}
                className="shrink-0 pointer-events-none"
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
