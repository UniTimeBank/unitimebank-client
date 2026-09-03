import { useEffect, useRef, useState } from 'react';
import { toast } from '@/shared/utils';

export interface UseHeartbeatProps {
  roomId?: string;
  isGroupRoom?: boolean;
  isLearner?: boolean;
  initialBalance?: number;
  initialActiveSeconds?: number;
  initialCreditsCharged?: number;
  onInsufficientBalance?: () => void;
  onTick?: (data: { activeSeconds: number; paidSeconds: number; credits: number }) => void;
}

export const useHeartbeat = ({
  roomId,
  isGroupRoom,
  isLearner,
  initialBalance,
  initialActiveSeconds = 0,
  initialCreditsCharged = 0,
  onInsufficientBalance,
  onTick,
}: UseHeartbeatProps) => {
  const FREE_LIMIT = 5 * 60; // 5 phút (300 giây) miễn phí

  const [currentBalance, setCurrentBalance] = useState<number | null>(
    initialBalance !== undefined ? initialBalance : null,
  );
  const [totalCreditsCharged, setTotalCreditsCharged] = useState(initialCreditsCharged);
  const [freeSecondsRemaining, setFreeSecondsRemaining] = useState(
    Math.max(0, FREE_LIMIT - initialActiveSeconds),
  );
  const [paidSeconds, setPaidSeconds] = useState(
    Math.max(0, initialActiveSeconds - FREE_LIMIT),
  );

  const warnedLowBalanceRef = useRef(false);
  const onInsufficientBalanceRef = useRef(onInsufficientBalance);
  const onTickRef = useRef(onTick);
  const lastEmittedCreditRef = useRef(initialCreditsCharged);
  const initialBalanceRef = useRef<number | null>(
    initialBalance !== undefined ? initialBalance : null,
  );

  useEffect(() => {
    onInsufficientBalanceRef.current = onInsufficientBalance;
    onTickRef.current = onTick;
  }, [onInsufficientBalance, onTick]);

  useEffect(() => {
    if (initialBalance !== undefined) {
      initialBalanceRef.current = initialBalance;
      setCurrentBalance(initialBalance);
    }
  }, [initialBalance]);

  useEffect(() => {
    if (!roomId || !isGroupRoom || !isLearner) return;

    const startTimestamp = Date.now();
    const baseActiveSeconds = initialActiveSeconds;
    const baseCreditsCharged = initialCreditsCharged;

    // Chu kỳ 1 giây đo lường thời gian thực dựa trên Date.now() và kế thừa baseActiveSeconds từ Backend
    // Hoàn toàn chạy mượt mà tại Frontend, không spam Socket request mỗi phút
    const countdownInterval = setInterval(() => {
      const elapsedInSession = Math.floor((Date.now() - startTimestamp) / 1000);
      const totalActiveSeconds = baseActiveSeconds + elapsedInSession;

      const freeRemaining = Math.max(0, FREE_LIMIT - totalActiveSeconds);
      const paid = Math.max(0, totalActiveSeconds - FREE_LIMIT);
      const totalCharged = Math.floor(paid / 60);

      setFreeSecondsRemaining(freeRemaining);
      setPaidSeconds(paid);
      setTotalCreditsCharged(totalCharged);

      if (totalCharged !== lastEmittedCreditRef.current) {
        lastEmittedCreditRef.current = totalCharged;
        onTickRef.current?.({
          activeSeconds: totalActiveSeconds,
          paidSeconds: paid,
          credits: totalCharged,
        });
      }

      if (initialBalanceRef.current !== null) {
        const sessionCreditsUsed = Math.max(0, totalCharged - baseCreditsCharged);
        const updatedBalance = Math.max(0, initialBalanceRef.current - sessionCreditsUsed);
        setCurrentBalance(updatedBalance);

        if (updatedBalance <= 2 && updatedBalance > 0 && !warnedLowBalanceRef.current) {
          warnedLowBalanceRef.current = true;
          toast.warning(
            'Số dư Credits sắp hết',
            'Tài khoản chỉ còn đủ cho 2 phút học tiếp theo!',
          );
        } else if (updatedBalance <= 0) {
          toast.error('Số dư Credits đã hết. Buổi học sẽ tự động dừng.');
          clearInterval(countdownInterval);
          onInsufficientBalanceRef.current?.();
        }
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [roomId, isGroupRoom, isLearner, initialActiveSeconds, initialCreditsCharged]);

  return {
    currentBalance,
    totalCreditsCharged,
    freeSecondsRemaining,
    paidSeconds,
  };
};
