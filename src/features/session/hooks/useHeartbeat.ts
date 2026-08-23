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
  const warnedLowBalanceRef = useRef(false);

  useEffect(() => {
    if (!roomId || !isGroupRoom || !isLearner) return;

    // Send initial heartbeat
    if (onHeartbeat) onHeartbeat();

    // 60-second cycle
    const interval = setInterval(() => {
      if (onHeartbeat) onHeartbeat();
    }, 60000);

    return () => clearInterval(interval);
  }, [roomId, isGroupRoom, isLearner, onHeartbeat]);

  const handleHeartbeatAck = (ack: HeartbeatAckEvent) => {
    if (ack.creditDeducted) {
      setTotalCreditsCharged((prev) => prev + ack.creditDeducted);
    }
    if (ack.newBalance !== undefined) {
      setCurrentBalance(ack.newBalance);

      if (ack.newBalance <= 2 && ack.newBalance > 0 && !warnedLowBalanceRef.current) {
        warnedLowBalanceRef.current = true;
        toast.warning(
          'Số dư Credits sắp hết',
          'Tài khoản chỉ còn đủ cho 2 phút học tiếp theo!',
        );
      } else if (ack.newBalance <= 0) {
        toast.error('Số dư Credits đã hết. Buổi học sẽ tự động dừng.');
        if (onInsufficientBalance) onInsufficientBalance();
      }
    }
  };

  return {
    currentBalance,
    totalCreditsCharged,
    handleHeartbeatAck,
  };
};
