import { useEffect, useRef, useState } from 'react';
import { toast } from '@/shared/utils';
import type { HeartbeatAckEvent } from '../types';

export interface UseHeartbeatProps {
  roomId?: string;
  isGroupRoom?: boolean;
  isLearner?: boolean;
  onHeartbeat?: () => void;
  onInsufficientBalance?: () => void;
}

export const useHeartbeat = ({
  roomId,
  isGroupRoom,
  isLearner,
  onHeartbeat,
  onInsufficientBalance,
}: UseHeartbeatProps) => {
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [totalCreditsCharged, setTotalCreditsCharged] = useState(0);
  const [freeSecondsRemaining, setFreeSecondsRemaining] = useState(5 * 60);
  const [paidSeconds, setPaidSeconds] = useState(0);
  const warnedLowBalanceRef = useRef(false);
  const onHeartbeatRef = useRef(onHeartbeat);
  const onInsufficientBalanceRef = useRef(onInsufficientBalance);

  useEffect(() => {
    onHeartbeatRef.current = onHeartbeat;
    onInsufficientBalanceRef.current = onInsufficientBalance;
  }, [onHeartbeat, onInsufficientBalance]);

  useEffect(() => {
    if (!roomId || !isGroupRoom || !isLearner) return;

    // Send initial heartbeat
    onHeartbeatRef.current?.();

    // 60-second cycle for backend metering sync
    const heartbeatInterval = setInterval(() => {
      onHeartbeatRef.current?.();
    }, 60000);

    // 1-second local interval for smooth real-time countdown timer & paid duration
    const countdownInterval = setInterval(() => {
      setFreeSecondsRemaining((prev) => {
        if (prev <= 0) {
          setPaidSeconds((ps) => ps + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(countdownInterval);
    };
  }, [roomId, isGroupRoom, isLearner]);

  const handleHeartbeatAck = (ack: HeartbeatAckEvent) => {
    if (ack.totalCreditsCharged !== undefined) {
      setTotalCreditsCharged(ack.totalCreditsCharged);
    } else if (ack.creditDeducted) {
      setTotalCreditsCharged((prev) => prev + ack.creditDeducted);
    }
    if (ack.freeSecondsRemaining !== undefined) {
      setFreeSecondsRemaining(ack.freeSecondsRemaining);
    }
    if (ack.newBalance !== undefined) {
      setCurrentBalance(ack.newBalance);

      if (ack.newBalance <= 2 && ack.newBalance > 0 && !warnedLowBalanceRef.current) {
        warnedLowBalanceRef.current = true;
        toast.warning(
          'Số dư Credits sắp hết',
          'Tài khoản chỉ còn đủ cho 2 phút học tiếp theo!',
        );
      } else if (ack.newBalance <= 0 || ack.insufficientBalance) {
        toast.error('Số dư Credits đã hết. Buổi học sẽ tự động dừng.');
        onInsufficientBalanceRef.current?.();
      }
    } else if (ack.insufficientBalance) {
      toast.error('Số dư Credits đã hết. Buổi học sẽ tự động dừng.');
      onInsufficientBalanceRef.current?.();
    }
  };

  return {
    currentBalance,
    totalCreditsCharged,
    freeSecondsRemaining,
    paidSeconds,
    handleHeartbeatAck,
  };
};
